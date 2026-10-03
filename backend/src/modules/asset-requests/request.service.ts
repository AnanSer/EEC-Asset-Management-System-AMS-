import { Prisma, RequestStatus, AssetCategory, AssetStatus } from '@prisma/client';
import prisma from '../../lib/prisma';
import { requestRepository, RequestRepository } from './request.repository';
import {
  CreateRequestDTO,
  ApproveRequestDTO,
  RejectRequestDTO,
  FulfillRequestDTO,
  RequestQueryDTO,
} from './request.validator';
import { ROLES, type Role } from '../../constants';
import { safeNotifyUser, safeNotifyUsers, getAdminUserIds } from '../notifications';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class RequestService {
  constructor(private repo: RequestRepository = requestRepository) {}

  /**
   * Helper to resolve active EmployeeProfile for a user
   */
  private async getEmployeeProfile(userId: string) {
    const profile = await prisma.employeeProfile.findUnique({
      where: { userId },
      include: { department: true, user: true },
    });
    if (!profile) {
      throw new AppError('No employee profile associated with this account', 400);
    }
    if (!profile.isActive) {
      throw new AppError('Employee profile is inactive and cannot request assets', 403);
    }
    return profile;
  }

  /**
   * Create asset request (EMPLOYEE, DEPARTMENT_MANAGER, etc.)
   */
  async createRequest(
    authUser: { id: string; email: string; role: Role },
    data: CreateRequestDTO
  ) {
    const profile = await this.getEmployeeProfile(authUser.id);

    const request = await this.repo.create({
      requesterId: profile.id,
      departmentId: profile.departmentId,
      category: data.category,
      description: data.description,
      notes: data.notes,
    });

    // Notify Admins about new asset request
    const adminIds = await getAdminUserIds();
    const categoryLabel = data.category.charAt(0) + data.category.slice(1).toLowerCase();
    await safeNotifyUsers(
      adminIds.map((adminId) => ({
        userId: adminId,
        title: 'New Asset Request',
        message: `${profile.firstName} ${profile.lastName} requested a ${categoryLabel} (${request.requestNumber}).`,
        type: 'INFO',
        link: '/admin/requests',
      }))
    );

    return request;
  }

  /**
   * Get requests with role-based scoping and pagination
   */
  async getRequests(
    authUser: { id: string; email: string; role: Role },
    query: RequestQueryDTO
  ) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetRequestWhereInput = {};

    // Personal filter or role-based resource scoping
    if (query.personal === 'true' || authUser.role === ROLES.EMPLOYEE || authUser.role === ROLES.IT_TECHNICIAN) {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: authUser.id },
      });
      if (profile) {
        where.requesterId = profile.id;
      } else {
        return {
          requests: [],
          meta: { total: 0, page, limit, totalPages: 1, hasNextPage: false, hasPrevPage: false },
        };
      }
    } else if (authUser.role === ROLES.DEPARTMENT_MANAGER) {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: authUser.id },
      });
      if (profile) {
        where.departmentId = profile.departmentId;
      }
    } else if (authUser.role === ROLES.STORE_KEEPER) {
      // Store Keeper can see approved requests ready for handover or query by status
      if (!query.status) {
        where.status = { in: [RequestStatus.APPROVED, RequestStatus.FULFILLED] };
      }
    }

    // Apply explicit query filters
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.departmentId && (authUser.role === ROLES.ADMIN || authUser.role === ROLES.STORE_KEEPER)) {
      where.departmentId = query.departmentId;
    }
    if (query.requesterId && (authUser.role === ROLES.ADMIN || authUser.role === ROLES.STORE_KEEPER)) {
      where.requesterId = query.requesterId;
    }

    // Search query
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { requestNumber: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { notes: { contains: term, mode: 'insensitive' } },
        {
          requester: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { employeeId: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
        { department: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const { requests, total } = await this.repo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      requests,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single request details
   */
  async getRequestById(
    authUser: { id: string; email: string; role: Role },
    id: string
  ) {
    const request = await this.repo.findById(id);
    if (!request) {
      throw new AppError('Asset request not found', 404);
    }

    // Access control
    if (authUser.role === ROLES.ADMIN || authUser.role === ROLES.STORE_KEEPER) {
      return request;
    }

    const profile = await prisma.employeeProfile.findUnique({
      where: { userId: authUser.id },
    });

    if (!profile) {
      throw new AppError('Access denied to this asset request', 403);
    }

    if (request.requesterId === profile.id) {
      return request;
    }

    if (authUser.role === ROLES.DEPARTMENT_MANAGER && request.departmentId === profile.departmentId) {
      return request;
    }

    throw new AppError('Access denied to this asset request', 403);
  }

  /**
   * Approve asset request (ADMIN only)
   * NOTE: Does NOT assign asset, does NOT change asset status, does NOT alter inventory.
   */
  async approveRequest(
    adminUser: { id: string; email: string; role: Role },
    id: string,
    data: ApproveRequestDTO
  ) {
    if (adminUser.role !== ROLES.ADMIN) {
      throw new AppError('Only administrators can approve asset requests', 403);
    }

    const request = await this.repo.findById(id);
    if (!request) {
      throw new AppError('Asset request not found', 404);
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new AppError(`Cannot approve request with status '${request.status}'. Only PENDING requests can be approved.`, 422);
    }

    const updated = await this.repo.update(id, {
      status: RequestStatus.APPROVED,
      approvedBy: { connect: { id: adminUser.id } },
      approvedAt: new Date(),
      approvalRemarks: data.approvalRemarks || null,
    });

    // Notify Requester
    if (request.requester?.user?.id) {
      const categoryLabel = request.category.charAt(0) + request.category.slice(1).toLowerCase();
      await safeNotifyUser({
        userId: request.requester.user.id,
        title: 'Asset Request Approved',
        message: `Your ${categoryLabel} request (${request.requestNumber}) has been approved and is awaiting physical handover.`,
        type: 'SUCCESS',
        link: '/my-requests',
      });
    }

    return updated;
  }

  /**
   * Reject asset request (ADMIN only)
   */
  async rejectRequest(
    adminUser: { id: string; email: string; role: Role },
    id: string,
    data: RejectRequestDTO
  ) {
    if (adminUser.role !== ROLES.ADMIN) {
      throw new AppError('Only administrators can reject asset requests', 403);
    }

    const request = await this.repo.findById(id);
    if (!request) {
      throw new AppError('Asset request not found', 404);
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new AppError(`Cannot reject request with status '${request.status}'. Only PENDING requests can be rejected.`, 422);
    }

    const updated = await this.repo.update(id, {
      status: RequestStatus.REJECTED,
      rejectedBy: { connect: { id: adminUser.id } },
      rejectedAt: new Date(),
      rejectionReason: data.rejectionReason,
    });

    // Notify Requester
    if (request.requester?.user?.id) {
      const categoryLabel = request.category.charAt(0) + request.category.slice(1).toLowerCase();
      await safeNotifyUser({
        userId: request.requester.user.id,
        title: 'Asset Request Rejected',
        message: `Your ${categoryLabel} request (${request.requestNumber}) was rejected: ${data.rejectionReason}`,
        type: 'WARNING',
        link: '/my-requests',
      });
    }

    return updated;
  }

  /**
   * Fulfill asset request via physical handover (STORE_KEEPER or ADMIN)
   * Atomic Transaction:
   * 1. Validate request is APPROVED
   * 2. Validate asset is AVAILABLE and matches requested category
   * 3. Create AssetAssignment (isCurrent: true)
   * 4. Update Asset: status = ASSIGNED, departmentId = request.departmentId
   * 5. Update AssetRequest: status = FULFILLED, fulfilledById, fulfilledAt, assetId, handoverNotes
   */
  async fulfillRequest(
    fulfillerUser: { id: string; email: string; role: Role },
    id: string,
    data: FulfillRequestDTO
  ) {
    if (fulfillerUser.role !== ROLES.STORE_KEEPER && fulfillerUser.role !== ROLES.ADMIN) {
      throw new AppError('Only Store Keepers or Administrators can fulfill asset handovers', 403);
    }

    const request = await this.repo.findById(id);
    if (!request) {
      throw new AppError('Asset request not found', 404);
    }
    if (request.status !== RequestStatus.APPROVED) {
      throw new AppError(
        `Cannot fulfill request with status '${request.status}'. Only APPROVED requests can be physically fulfilled.`,
        422
      );
    }

    // Atomic transaction for concurrency protection
    const fulfilledRequest = await prisma.$transaction(async (tx) => {
      // 1. Fetch asset inside transaction
      const asset = await tx.asset.findUnique({
        where: { id: data.assetId },
      });

      if (!asset) {
        throw new AppError('Selected asset not found', 404);
      }

      // 2. Strict concurrency check: Must be genuinely AVAILABLE
      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new AppError('This asset is no longer available. Please select another asset.', 409);
      }

      // 3. Category match check
      if (asset.category !== request.category) {
        throw new AppError(
          `Selected asset (${asset.assetCode}) category '${asset.category}' does not match requested category '${request.category}'`,
          422
        );
      }

      const assignedDate = new Date();

      // 4. Create AssetAssignment record using existing assignment architecture
      await tx.assetAssignment.create({
        data: {
          assetId: asset.id,
          employeeId: request.requesterId,
          assignedDate,
          conditionOnAssign: data.conditionOnAssign || asset.condition,
          isCurrent: true,
          notes: data.handoverNotes || `Assigned via request ${request.requestNumber}`,
        },
      });

      // 5. Update Asset status to ASSIGNED
      await tx.asset.update({
        where: { id: asset.id },
        data: {
          status: AssetStatus.ASSIGNED,
          departmentId: request.departmentId,
        },
      });

      // 6. Mark request as FULFILLED
      const updatedReq = await tx.assetRequest.update({
        where: { id },
        data: {
          status: RequestStatus.FULFILLED,
          fulfilledBy: { connect: { id: fulfillerUser.id } },
          fulfilledAt: new Date(),
          asset: { connect: { id: asset.id } },
          handoverNotes: data.handoverNotes || null,
        },
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
          fulfilledBy: { select: { id: true, email: true } },
        },
      });

      return { updatedReq, asset };
    });

    // 7. Notify Requester that asset was physically handed over and assigned
    if (request.requester?.user?.id) {
      await safeNotifyUser({
        userId: request.requester.user.id,
        title: 'Asset Assigned',
        message: `${fulfilledRequest.asset.category} ${fulfilledRequest.asset.assetCode} (${fulfilledRequest.asset.name}) has been physically handed over and assigned to you.`,
        type: 'SUCCESS',
        link: '/my-assets',
      });
    }

    return fulfilledRequest.updatedReq;
  }

  /**
   * Cancel asset request (Requester only, while PENDING)
   */
  async cancelRequest(
    authUser: { id: string; email: string; role: Role },
    id: string
  ) {
    const request = await this.repo.findById(id);
    if (!request) {
      throw new AppError('Asset request not found', 404);
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new AppError(`Cannot cancel request with status '${request.status}'. Only PENDING requests can be cancelled.`, 422);
    }

    // Verify ownership
    if (authUser.role !== ROLES.ADMIN) {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: authUser.id },
      });
      if (!profile || request.requesterId !== profile.id) {
        throw new AppError('You can only cancel your own pending requests', 403);
      }
    }

    return this.repo.update(id, {
      status: RequestStatus.CANCELLED,
    });
  }
}

export const requestService = new RequestService();
