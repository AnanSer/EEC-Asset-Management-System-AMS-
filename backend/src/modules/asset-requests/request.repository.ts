import { Prisma, RequestStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { CreateRequestDTO } from './request.validator';

export class RequestRepository {
  /**
   * Generate sequential request number: AR-YYYY-XXXX
   */
  async generateRequestNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.assetRequest.count();
    const sequence = String(count + 1).padStart(4, '0');
    return `AR-${year}-${sequence}`;
  }

  /**
   * Create a new asset request
   */
  async create(data: {
    requesterId: string;
    departmentId: string;
    category: CreateRequestDTO['category'];
    description: string;
    notes?: string;
  }) {
    const requestNumber = await this.generateRequestNumber();

    return prisma.assetRequest.create({
      data: {
        requestNumber,
        requesterId: data.requesterId,
        departmentId: data.departmentId,
        category: data.category,
        description: data.description,
        notes: data.notes || null,
        status: RequestStatus.PENDING,
      },
      include: {
        requester: {
          include: {
            department: true,
            user: { select: { id: true, email: true } },
          },
        },
        department: true,
      },
    });
  }

  /**
   * Find request by ID with all relations
   */
  async findById(id: string) {
    return prisma.assetRequest.findUnique({
      where: { id },
      include: {
        requester: {
          include: {
            department: true,
            user: { select: { id: true, email: true } },
          },
        },
        department: true,
        asset: {
          include: {
            department: true,
          },
        },
        approvedBy: {
          select: { id: true, email: true },
        },
        rejectedBy: {
          select: { id: true, email: true },
        },
        fulfilledBy: {
          select: { id: true, email: true },
        },
      },
    });
  }

  /**
   * Find requests with filters and pagination
   */
  async findMany(params: {
    where?: Prisma.AssetRequestWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.AssetRequestOrderByWithRelationInput;
  }) {
    const { where, skip = 0, take = 10, orderBy = { createdAt: 'desc' } } = params;

    const [requests, total] = await Promise.all([
      prisma.assetRequest.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          requester: {
            include: {
              department: true,
              user: { select: { id: true, email: true } },
            },
          },
          department: true,
          asset: true,
          approvedBy: { select: { id: true, email: true } },
          rejectedBy: { select: { id: true, email: true } },
          fulfilledBy: { select: { id: true, email: true } },
        },
      }),
      prisma.assetRequest.count({ where }),
    ]);

    return { requests, total };
  }

  /**
   * Update request
   */
  async update(id: string, data: Prisma.AssetRequestUpdateInput) {
    return prisma.assetRequest.update({
      where: { id },
      data,
      include: {
        requester: {
          include: {
            department: true,
            user: { select: { id: true, email: true } },
          },
        },
        department: true,
        asset: true,
        approvedBy: { select: { id: true, email: true } },
        rejectedBy: { select: { id: true, email: true } },
        fulfilledBy: { select: { id: true, email: true } },
      },
    });
  }

  /**
   * Count requests
   */
  async count(where?: Prisma.AssetRequestWhereInput) {
    return prisma.assetRequest.count({ where });
  }
}

export const requestRepository = new RequestRepository();
