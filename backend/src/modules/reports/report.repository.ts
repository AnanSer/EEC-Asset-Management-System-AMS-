import prisma from '../../lib/prisma';
import { AssetStatus, MaintenanceStatus, MaintenancePriority, AssetCategory, Prisma } from '@prisma/client';

export class ReportRepository {
  /**
   * KPI counts and chart aggregation data for the Executive Reports Dashboard
   */
  async getDashboardMetrics() {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalAssets,
      assignedAssets,
      availableAssets,
      assetsUnderTesting,
      activeEmployees,
      totalDepartments,
      openMaintenanceTickets,
      warrantyExpiringSoon,
      warranty30,
      warranty60,
      assetsByCategoryRaw,
      maintenanceByStatusRaw,
      maintenanceByPriorityRaw,
      departmentsWithAssets,
      recentTickets,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: AssetStatus.ASSIGNED } }),
      prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      prisma.asset.count({ where: { status: AssetStatus.TESTING } }),
      prisma.employeeProfile.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.maintenanceTicket.count({
        where: {
          status: {
            in: [
              MaintenanceStatus.OPEN,
              MaintenanceStatus.IN_PROGRESS,
              MaintenanceStatus.TESTING,
              MaintenanceStatus.ON_HOLD,
            ],
          },
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: {
            gte: now,
            lte: in90Days,
          },
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: {
            gte: now,
            lte: in30Days,
          },
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: {
            gt: in30Days,
            lte: in60Days,
          },
        },
      }),
      prisma.asset.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      prisma.maintenanceTicket.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.maintenanceTicket.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      prisma.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          code: true,
          name: true,
          _count: {
            select: { assets: true },
          },
        },
        orderBy: {
          assets: {
            _count: 'desc',
          },
        },
      }),
      prisma.maintenanceTicket.findMany({
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Format Monthly Tickets (group by YYYY-MM)
    const monthMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthMap.set(key, 0);
    }

    recentTickets.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    });

    const monthlyMaintenance = Array.from(monthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    return {
      kpis: {
        totalAssets,
        assignedAssets,
        availableAssets,
        activeEmployees,
        totalDepartments,
        openMaintenanceTickets,
        assetsUnderTesting,
        warrantyExpiringSoon,
      },
      warrantySummary: {
        expiring30: warranty30,
        expiring60: warranty60,
        expiring90: warrantyExpiringSoon,
      },
      charts: {
        assetsByDepartment: departmentsWithAssets.map((d) => ({
          departmentName: d.name,
          code: d.code,
          count: d._count.assets,
        })),
        assetsByCategory: assetsByCategoryRaw.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
        maintenanceByStatus: maintenanceByStatusRaw.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        maintenanceByPriority: maintenanceByPriorityRaw.map((p) => ({
          priority: p.priority,
          count: p._count.id,
        })),
        monthlyMaintenance,
      },
    };
  }

  /**
   * Assets Detailed Report with Aggregations and Filtering
   */
  async getAssetsReport(params: {
    search?: string;
    category?: string;
    status?: string;
    condition?: string;
    departmentId?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, category, status, condition, departmentId, skip, take } = params;
    const where: Prisma.AssetWhereInput = {};

    if (category && category !== 'all') {
      where.category = category as AssetCategory;
    }
    if (status && status !== 'all') {
      where.status = status as AssetStatus;
    }
    if (condition && condition !== 'all') {
      where.condition = condition as any;
    }
    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { assetCode: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [assets, total, priceAggregate] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
          assignments: {
            where: { isCurrent: true },
            include: {
              employee: {
                select: { id: true, employeeId: true, firstName: true, lastName: true },
              },
            },
            take: 1,
          },
        },
      }),
      prisma.asset.count({ where }),
      prisma.asset.aggregate({
        where,
        _sum: {
          purchasePrice: true,
        },
      }),
    ]);

    return {
      assets: assets.map((a) => ({
        id: a.id,
        assetCode: a.assetCode,
        name: a.name,
        category: a.category,
        brand: a.brand,
        model: a.model,
        serialNumber: a.serialNumber,
        status: a.status,
        condition: a.condition,
        location: a.location,
        purchaseDate: a.purchaseDate,
        purchasePrice: a.purchasePrice ? Number(a.purchasePrice) : null,
        warrantyExpiry: a.warrantyExpiry,
        department: a.department,
        assignedTo: a.assignments[0]?.employee
          ? {
              id: a.assignments[0].employee.id,
              employeeId: a.assignments[0].employee.employeeId,
              fullName: `${a.assignments[0].employee.firstName} ${a.assignments[0].employee.lastName}`.trim(),
            }
          : null,
      })),
      total,
      totalValue: Number(priceAggregate._sum.purchasePrice || 0),
    };
  }

  /**
   * Employees Detailed Report with Assigned Asset Counts
   */
  async getEmployeesReport(params: {
    search?: string;
    departmentId?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, departmentId, isActive, skip, take } = params;
    const where: Prisma.EmployeeProfileWhereInput = {};

    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { employeeId: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employeeProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, role: true },
          },
          department: {
            select: { id: true, name: true, code: true },
          },
          assetAssignments: {
            where: { isCurrent: true },
            include: {
              asset: {
                select: { id: true, assetCode: true, name: true, category: true, status: true },
              },
            },
          },
        },
      }),
      prisma.employeeProfile.count({ where }),
    ]);

    return {
      employees: employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        fullName: `${e.firstName} ${e.lastName}`.trim(),
        email: e.user?.email || '',
        role: e.user?.role || '',
        jobTitle: e.jobTitle,
        department: e.department,
        isActive: e.isActive,
        assignedAssetsCount: e.assetAssignments.length,
        assignedAssets: e.assetAssignments.map((assign) => assign.asset),
      })),
      total,
    };
  }

  /**
   * Departments Detailed Report with Comprehensive Asset Breakdown
   */
  async getDepartmentsReport(params: {
    search?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, isActive, skip, take } = params;
    const where: Prisma.DepartmentWhereInput = {};

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              employees: true,
              assets: true,
            },
          },
          assets: {
            select: {
              status: true,
            },
          },
        },
      }),
      prisma.department.count({ where }),
    ]);

    return {
      departments: departments.map((d) => {
        let assigned = 0;
        let available = 0;
        let maintenance = 0;
        let testing = 0;

        d.assets.forEach((a) => {
          if (a.status === AssetStatus.ASSIGNED) assigned++;
          else if (a.status === AssetStatus.AVAILABLE) available++;
          else if (a.status === AssetStatus.MAINTENANCE) maintenance++;
          else if (a.status === AssetStatus.TESTING) testing++;
        });

        return {
          id: d.id,
          code: d.code,
          name: d.name,
          location: d.location || d.officeLocation || 'Main Campus',
          headOfDepartment: d.headOfDepartment || 'Unassigned',
          isActive: d.isActive,
          employeeCount: d._count.employees,
          totalAssets: d._count.assets,
          assignedAssets: assigned,
          availableAssets: available,
          maintenanceAssets: maintenance,
          testingAssets: testing,
        };
      }),
      total,
    };
  }

  /**
   * Maintenance Detailed Report with Service Cost Aggregations
   */
  async getMaintenanceReport(params: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, status, priority, category, skip, take } = params;
    const where: Prisma.MaintenanceTicketWhereInput = {};

    if (status && status !== 'all') {
      where.status = status as MaintenanceStatus;
    }
    if (priority && priority !== 'all') {
      where.priority = priority as MaintenancePriority;
    }
    if (category && category !== 'all') {
      where.title = category;
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { reportedBy: { contains: q, mode: 'insensitive' } },
        { assignedTechnician: { contains: q, mode: 'insensitive' } },
        { asset: { name: { contains: q, mode: 'insensitive' } } },
        { asset: { assetCode: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total, costAgg] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          asset: {
            select: {
              id: true,
              assetCode: true,
              name: true,
              category: true,
            },
          },
          inspectionTests: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              status: true,
              passed: true,
            },
          },
        },
      }),
      prisma.maintenanceTicket.count({ where }),
      prisma.maintenanceTicket.aggregate({
        where,
        _sum: {
          cost: true,
        },
      }),
    ]);

    return {
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        cost: t.cost ? Number(t.cost) : null,
        reportedBy: t.reportedBy || 'Staff Member',
        assignedTechnician: t.assignedTechnician || 'Unassigned',
        startDate: t.startDate,
        completedDate: t.completedDate,
        createdAt: t.createdAt,
        asset: t.asset,
        inspectionStatus: t.inspectionTests[0]?.status || null,
      })),
      total,
      totalCost: Number(costAgg._sum.cost || 0),
    };
  }

  /**
   * Warranty Center Detailed Report
   */
  async getWarrantyReport(params: {
    search?: string;
    timeframe?: '30' | '60' | '90' | 'expired' | 'all';
    departmentId?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, timeframe = 'all', departmentId, skip, take } = params;
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const where: Prisma.AssetWhereInput = {
      warrantyExpiry: { not: null },
    };

    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }

    if (timeframe === '30') {
      where.warrantyExpiry = { gte: now, lte: in30Days };
    } else if (timeframe === '60') {
      where.warrantyExpiry = { gte: now, lte: in60Days };
    } else if (timeframe === '90') {
      where.warrantyExpiry = { gte: now, lte: in90Days };
    } else if (timeframe === 'expired') {
      where.warrantyExpiry = { lt: now };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { assetCode: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { serialNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Counts for buckets
    const [assets, total, count30, count60, count90, countExpired] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { warrantyExpiry: 'asc' },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.asset.count({ where }),
      prisma.asset.count({
        where: {
          warrantyExpiry: { gte: now, lte: in30Days },
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: { gte: now, lte: in60Days },
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: { gte: now, lte: in90Days },
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
        },
      }),
      prisma.asset.count({
        where: {
          warrantyExpiry: { lt: now },
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
        },
      }),
    ]);

    return {
      assets: assets.map((a) => {
        const expiry = a.warrantyExpiry ? new Date(a.warrantyExpiry) : null;
        let daysRemaining: number | null = null;
        let urgency: 'EXPIRED' | 'CRITICAL_30' | 'MODERATE_60' | 'UPCOMING_90' | 'HEALTHY' = 'HEALTHY';

        if (expiry) {
          const diffMs = expiry.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (daysRemaining < 0) urgency = 'EXPIRED';
          else if (daysRemaining <= 30) urgency = 'CRITICAL_30';
          else if (daysRemaining <= 60) urgency = 'MODERATE_60';
          else if (daysRemaining <= 90) urgency = 'UPCOMING_90';
        }

        return {
          id: a.id,
          assetCode: a.assetCode,
          name: a.name,
          category: a.category,
          serialNumber: a.serialNumber,
          status: a.status,
          condition: a.condition,
          purchaseDate: a.purchaseDate,
          warrantyExpiry: a.warrantyExpiry,
          daysRemaining,
          urgency,
          department: a.department,
        };
      }),
      total,
      buckets: {
        within30Days: count30,
        within60Days: count60,
        within90Days: count90,
        expired: countExpired,
      },
    };
  }
}

export const reportRepository = new ReportRepository();
