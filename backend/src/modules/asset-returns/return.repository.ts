import prisma from '../../lib/prisma';
import { Prisma, ReturnRequestStatus } from '@prisma/client';

export class ReturnRepository {
  /**
   * Generates a sequential request number: RR-YYYY-XXXX
   */
  async generateRequestNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `RR-${currentYear}-`;

    const count = await prisma.assetReturnRequest.count({
      where: {
        requestNumber: {
          startsWith: prefix,
        },
      },
    });

    const nextSeq = (count + 1).toString().padStart(4, '0');
    return `${prefix}${nextSeq}`;
  }

  async findMany(options: {
    where?: Prisma.AssetReturnRequestWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.AssetReturnRequestOrderByWithRelationInput;
  }) {
    const [returns, total] = await Promise.all([
      prisma.assetReturnRequest.findMany({
        where: options.where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { createdAt: 'desc' },
        include: {
          requester: {
            include: {
              department: true,
              user: {
                select: { id: true, email: true },
              },
            },
          },
          department: true,
          asset: {
            include: {
              assignments: {
                where: { isCurrent: true },
                include: {
                  employee: true,
                },
              },
            },
          },
          receivedBy: {
            select: {
              id: true,
              email: true,
              role: true,
              employeeProfile: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.assetReturnRequest.count({ where: options.where }),
    ]);

    return { returns, total };
  }

  async findById(id: string) {
    return prisma.assetReturnRequest.findUnique({
      where: { id },
      include: {
        requester: {
          include: {
            department: true,
            user: {
              select: { id: true, email: true },
            },
          },
        },
        department: true,
        asset: {
          include: {
            assignments: {
              where: { isCurrent: true },
              include: {
                employee: true,
              },
            },
          },
        },
        receivedBy: {
          select: {
            id: true,
            email: true,
            role: true,
            employeeProfile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  }

  async findPendingByAssetId(assetId: string) {
    return prisma.assetReturnRequest.findFirst({
      where: {
        assetId,
        status: ReturnRequestStatus.PENDING,
      },
    });
  }

  async create(data: Prisma.AssetReturnRequestCreateInput) {
    return prisma.assetReturnRequest.create({
      data,
      include: {
        requester: {
          include: {
            department: true,
            user: {
              select: { id: true, email: true },
            },
          },
        },
        department: true,
        asset: true,
      },
    });
  }

  async update(id: string, data: Prisma.AssetReturnRequestUpdateInput) {
    return prisma.assetReturnRequest.update({
      where: { id },
      data,
      include: {
        requester: {
          include: {
            department: true,
            user: {
              select: { id: true, email: true },
            },
          },
        },
        department: true,
        asset: true,
        receivedBy: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }
}

export const returnRepository = new ReturnRepository();
