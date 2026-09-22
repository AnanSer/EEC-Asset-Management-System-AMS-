import prisma from '../../lib/prisma';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';

export class MaintenanceRepository {
  private defaultInclude = {
    asset: {
      include: {
        department: true,
        assignments: {
          where: { isCurrent: true },
          include: {
            employee: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    },
    inspectionTests: {
      orderBy: { createdAt: 'desc' as const },
    },
  };

  async findMany(params: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    technician?: string;
    assetId?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, status, priority, category, technician, assetId, skip, take } = params;
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status as MaintenanceStatus;
    }

    if (priority && priority !== 'all') {
      where.priority = priority as MaintenancePriority;
    }

    if (category && category !== 'all') {
      where.title = category;
    }

    if (technician && technician !== 'all') {
      where.assignedTechnician = { contains: technician, mode: 'insensitive' };
    }

    if (assetId) {
      where.assetId = assetId;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { ticketNumber: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { reportedBy: { contains: term, mode: 'insensitive' } },
        { assignedTechnician: { contains: term, mode: 'insensitive' } },
        { asset: { name: { contains: term, mode: 'insensitive' } } },
        { asset: { assetCode: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.maintenanceTicket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.defaultInclude,
      }),
      prisma.maintenanceTicket.count({ where }),
    ]);

    return { tickets, total };
  }

  async findById(id: string) {
    return prisma.maintenanceTicket.findUnique({
      where: { id },
      include: this.defaultInclude,
    });
  }

  async findByTicketNumber(ticketNumber: string) {
    return prisma.maintenanceTicket.findUnique({
      where: { ticketNumber },
      include: this.defaultInclude,
    });
  }

  async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.maintenanceTicket.count();
    const sequence = String(count + 1).padStart(4, '0');
    let ticketNum = `EEC-MNT-${year}-${sequence}`;

    // Ensure uniqueness
    let exists = await prisma.maintenanceTicket.findUnique({
      where: { ticketNumber: ticketNum },
    });
    let extra = 1;
    while (exists) {
      ticketNum = `EEC-MNT-${year}-${String(count + 1 + extra).padStart(4, '0')}`;
      exists = await prisma.maintenanceTicket.findUnique({
        where: { ticketNumber: ticketNum },
      });
      extra++;
    }

    return ticketNum;
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [openTickets, inProgress, testing, completedThisMonth, recentTickets] =
      await Promise.all([
        prisma.maintenanceTicket.count({ where: { status: 'OPEN' } }),
        prisma.maintenanceTicket.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.maintenanceTicket.count({ where: { status: 'TESTING' } }),
        prisma.maintenanceTicket.count({
          where: {
            status: 'COMPLETED',
            completedDate: { gte: startOfMonth },
          },
        }),
        prisma.maintenanceTicket.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: this.defaultInclude,
        }),
      ]);

    return {
      openTickets,
      inProgress,
      testing,
      completedThisMonth,
      recentTickets,
    };
  }
}

export const maintenanceRepository = new MaintenanceRepository();
