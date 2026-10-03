"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestService = exports.RequestService = exports.AppError = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const request_repository_1 = require("./request.repository");
const constants_1 = require("../../constants");
const notifications_1 = require("../notifications");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class RequestService {
    constructor(repo = request_repository_1.requestRepository) {
        this.repo = repo;
    }
    /**
     * Helper to resolve active EmployeeProfile for a user
     */
    async getEmployeeProfile(userId) {
        const profile = await prisma_1.default.employeeProfile.findUnique({
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
    async createRequest(authUser, data) {
        const profile = await this.getEmployeeProfile(authUser.id);
        const request = await this.repo.create({
            requesterId: profile.id,
            departmentId: profile.departmentId,
            category: data.category,
            description: data.description,
            notes: data.notes,
        });
        // Notify Admins about new asset request
        const adminIds = await (0, notifications_1.getAdminUserIds)();
        const categoryLabel = data.category.charAt(0) + data.category.slice(1).toLowerCase();
        await (0, notifications_1.safeNotifyUsers)(adminIds.map((adminId) => ({
            userId: adminId,
            title: 'New Asset Request',
            message: `${profile.firstName} ${profile.lastName} requested a ${categoryLabel} (${request.requestNumber}).`,
            type: 'INFO',
            link: '/admin/requests',
        })));
        return request;
    }
    /**
     * Get requests with role-based scoping and pagination
     */
    async getRequests(authUser, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Personal filter or role-based resource scoping
        if (query.personal === 'true' || authUser.role === constants_1.ROLES.EMPLOYEE || authUser.role === constants_1.ROLES.IT_TECHNICIAN) {
            const profile = await prisma_1.default.employeeProfile.findUnique({
                where: { userId: authUser.id },
            });
            if (profile) {
                where.requesterId = profile.id;
            }
            else {
                return {
                    requests: [],
                    meta: { total: 0, page, limit, totalPages: 1, hasNextPage: false, hasPrevPage: false },
                };
            }
        }
        else if (authUser.role === constants_1.ROLES.DEPARTMENT_MANAGER) {
            const profile = await prisma_1.default.employeeProfile.findUnique({
                where: { userId: authUser.id },
            });
            if (profile) {
                where.departmentId = profile.departmentId;
            }
        }
        else if (authUser.role === constants_1.ROLES.STORE_KEEPER) {
            // Store Keeper can see approved requests ready for handover or query by status
            if (!query.status) {
                where.status = { in: [client_1.RequestStatus.APPROVED, client_1.RequestStatus.FULFILLED] };
            }
        }
        // Apply explicit query filters
        if (query.status) {
            where.status = query.status;
        }
        if (query.category) {
            where.category = query.category;
        }
        if (query.departmentId && (authUser.role === constants_1.ROLES.ADMIN || authUser.role === constants_1.ROLES.STORE_KEEPER)) {
            where.departmentId = query.departmentId;
        }
        if (query.requesterId && (authUser.role === constants_1.ROLES.ADMIN || authUser.role === constants_1.ROLES.STORE_KEEPER)) {
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
    async getRequestById(authUser, id) {
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Asset request not found', 404);
        }
        // Access control
        if (authUser.role === constants_1.ROLES.ADMIN || authUser.role === constants_1.ROLES.STORE_KEEPER) {
            return request;
        }
        const profile = await prisma_1.default.employeeProfile.findUnique({
            where: { userId: authUser.id },
        });
        if (!profile) {
            throw new AppError('Access denied to this asset request', 403);
        }
        if (request.requesterId === profile.id) {
            return request;
        }
        if (authUser.role === constants_1.ROLES.DEPARTMENT_MANAGER && request.departmentId === profile.departmentId) {
            return request;
        }
        throw new AppError('Access denied to this asset request', 403);
    }
    /**
     * Approve asset request (ADMIN only)
     * NOTE: Does NOT assign asset, does NOT change asset status, does NOT alter inventory.
     */
    async approveRequest(adminUser, id, data) {
        if (adminUser.role !== constants_1.ROLES.ADMIN) {
            throw new AppError('Only administrators can approve asset requests', 403);
        }
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Asset request not found', 404);
        }
        if (request.status !== client_1.RequestStatus.PENDING) {
            throw new AppError(`Cannot approve request with status '${request.status}'. Only PENDING requests can be approved.`, 422);
        }
        const updated = await this.repo.update(id, {
            status: client_1.RequestStatus.APPROVED,
            approvedBy: { connect: { id: adminUser.id } },
            approvedAt: new Date(),
            approvalRemarks: data.approvalRemarks || null,
        });
        // Notify Requester
        if (request.requester?.user?.id) {
            const categoryLabel = request.category.charAt(0) + request.category.slice(1).toLowerCase();
            await (0, notifications_1.safeNotifyUser)({
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
    async rejectRequest(adminUser, id, data) {
        if (adminUser.role !== constants_1.ROLES.ADMIN) {
            throw new AppError('Only administrators can reject asset requests', 403);
        }
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Asset request not found', 404);
        }
        if (request.status !== client_1.RequestStatus.PENDING) {
            throw new AppError(`Cannot reject request with status '${request.status}'. Only PENDING requests can be rejected.`, 422);
        }
        const updated = await this.repo.update(id, {
            status: client_1.RequestStatus.REJECTED,
            rejectedBy: { connect: { id: adminUser.id } },
            rejectedAt: new Date(),
            rejectionReason: data.rejectionReason,
        });
        // Notify Requester
        if (request.requester?.user?.id) {
            const categoryLabel = request.category.charAt(0) + request.category.slice(1).toLowerCase();
            await (0, notifications_1.safeNotifyUser)({
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
    async fulfillRequest(fulfillerUser, id, data) {
        if (fulfillerUser.role !== constants_1.ROLES.STORE_KEEPER && fulfillerUser.role !== constants_1.ROLES.ADMIN) {
            throw new AppError('Only Store Keepers or Administrators can fulfill asset handovers', 403);
        }
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Asset request not found', 404);
        }
        if (request.status !== client_1.RequestStatus.APPROVED) {
            throw new AppError(`Cannot fulfill request with status '${request.status}'. Only APPROVED requests can be physically fulfilled.`, 422);
        }
        // Atomic transaction for concurrency protection
        const fulfilledRequest = await prisma_1.default.$transaction(async (tx) => {
            // 1. Fetch asset inside transaction
            const asset = await tx.asset.findUnique({
                where: { id: data.assetId },
            });
            if (!asset) {
                throw new AppError('Selected asset not found', 404);
            }
            // 2. Strict concurrency check: Must be genuinely AVAILABLE
            if (asset.status !== client_1.AssetStatus.AVAILABLE) {
                throw new AppError('This asset is no longer available. Please select another asset.', 409);
            }
            // 3. Category match check
            if (asset.category !== request.category) {
                throw new AppError(`Selected asset (${asset.assetCode}) category '${asset.category}' does not match requested category '${request.category}'`, 422);
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
                    status: client_1.AssetStatus.ASSIGNED,
                    departmentId: request.departmentId,
                },
            });
            // 6. Mark request as FULFILLED
            const updatedReq = await tx.assetRequest.update({
                where: { id },
                data: {
                    status: client_1.RequestStatus.FULFILLED,
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
            await (0, notifications_1.safeNotifyUser)({
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
    async cancelRequest(authUser, id) {
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Asset request not found', 404);
        }
        if (request.status !== client_1.RequestStatus.PENDING) {
            throw new AppError(`Cannot cancel request with status '${request.status}'. Only PENDING requests can be cancelled.`, 422);
        }
        // Verify ownership
        if (authUser.role !== constants_1.ROLES.ADMIN) {
            const profile = await prisma_1.default.employeeProfile.findUnique({
                where: { userId: authUser.id },
            });
            if (!profile || request.requesterId !== profile.id) {
                throw new AppError('You can only cancel your own pending requests', 403);
            }
        }
        return this.repo.update(id, {
            status: client_1.RequestStatus.CANCELLED,
        });
    }
}
exports.RequestService = RequestService;
exports.requestService = new RequestService();
//# sourceMappingURL=request.service.js.map