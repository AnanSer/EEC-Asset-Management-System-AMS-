import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

const assignmentInclude = {
  asset: {
    select: {
      id: true,
      assetCode: true,
      name: true,
      category: true,
      brand: true,
      model: true,
      serialNumber: true,
      status: true,
      condition: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  },
  employee: {
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

export class AssignmentRepository {
  async findMany(params: {
    search?: string;
    departmentId?: string;
    employeeId?: string;
    assetId?: string;
    isCurrent?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, departmentId, employeeId, assetId, isCurrent, skip, take } = params;

    const where: Prisma.AssetAssignmentWhereInput = {};

    if (typeof isCurrent === 'boolean') {
      where.isCurrent = isCurrent;
    }

    if (employeeId && employeeId !== 'all') {
      where.employeeId = employeeId;
    }

    if (assetId && assetId !== 'all') {
      where.assetId = assetId;
    }

    if (departmentId && departmentId !== 'all') {
      where.employee = {
        departmentId,
      };
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { asset: { assetCode: { contains: term, mode: 'insensitive' } } },
        { asset: { name: { contains: term, mode: 'insensitive' } } },
        { employee: { firstName: { contains: term, mode: 'insensitive' } } },
        { employee: { lastName: { contains: term, mode: 'insensitive' } } },
        { employee: { employeeId: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [assignments, total] = await Promise.all([
      prisma.assetAssignment.findMany({
        where,
        skip,
        take,
        orderBy: { assignedDate: 'desc' },
        include: assignmentInclude,
      }),
      prisma.assetAssignment.count({ where }),
    ]);

    return { assignments, total };
  }

  async findById(id: string) {
    return prisma.assetAssignment.findUnique({
      where: { id },
      include: assignmentInclude,
    });
  }

  async findActiveByAssetId(assetId: string) {
    return prisma.assetAssignment.findFirst({
      where: {
        assetId,
        isCurrent: true,
      },
      include: assignmentInclude,
    });
  }

  async findHistoryByAssetId(assetId: string) {
    return prisma.assetAssignment.findMany({
      where: { assetId },
      orderBy: { assignedDate: 'desc' },
      include: assignmentInclude,
    });
  }

  async getDashboardStats() {
    const [
      availableAssets,
      assignedAssets,
      employeesWithAssetsCount,
      recentAssignments,
      totalAssignments,
      activeAssignments,
      returnedAssignments,
    ] = await Promise.all([
      prisma.asset.count({ where: { status: 'AVAILABLE' } }),
      prisma.asset.count({ where: { status: 'ASSIGNED' } }),
      prisma.assetAssignment
        .groupBy({
          by: ['employeeId'],
          where: { isCurrent: true },
        })
        .then((groups) => groups.length),
      prisma.assetAssignment.findMany({
        take: 5,
        orderBy: { assignedDate: 'desc' },
        include: assignmentInclude,
      }),
      prisma.assetAssignment.count(),
      prisma.assetAssignment.count({ where: { isCurrent: true } }),
      prisma.assetAssignment.count({ where: { isCurrent: false } }),
    ]);

    return {
      availableAssets,
      assignedAssets,
      employeesWithAssets: employeesWithAssetsCount,
      recentAssignments,
      totalAssignments,
      activeAssignments,
      returnedAssignments,
    };
  }
}

export const assignmentRepository = new AssignmentRepository();
