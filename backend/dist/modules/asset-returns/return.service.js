"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnService = exports.ReturnService = exports.AppError = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const return_repository_1 = require("./return.repository");
const constants_1 = require("../../constants");
const client_1 = require("@prisma/client");
const notifications_1 = require("../notifications");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class ReturnService {
    constructor(repo = return_repository_1.returnRepository) {
        this.repo = repo;
    }
    /**
     * Helper to fetch authenticated user's EmployeeProfile
     */
    async getEmployeeProfile(userId) {
        const profile = await prisma_1.default.employeeProfile.findUnique({
            where: { userId },
            include: { department: true },
        });
        return profile;
    }
    /**
     * POST /api/returns - Create a new return request
     * Path A: Employee or Department Manager creates request
     */
    async createReturnRequest(authUser, data) {
        const profile = await this.getEmployeeProfile(authUser.id);
        if (!profile) {
            throw new AppError('Only registered employee profiles can submit asset return requests', 403);
        }
        // 1. Validate Asset
        const asset = await prisma_1.default.asset.findUnique({
            where: { id: data.assetId },
            include: { department: true },
        });
        if (!asset) {
            throw new AppError('Asset not found', 404);
        }
        if (asset.status !== client_1.AssetStatus.ASSIGNED) {
            throw new AppError(`Only currently ASSIGNED assets can be requested for return. Asset '${asset.assetCode}' is currently ${asset.status}.`, 422);
        }
        // 2. Validate Active Assignment
        const activeAssignment = await prisma_1.default.assetAssignment.findFirst({
            where: {
                assetId: asset.id,
                isCurrent: true,
            },
            include: {
                employee: true,
            },
        });
        if (!activeAssignment) {
            throw new AppError(`No active assignment record found for asset '${asset.assetCode}'.`, 404);
        }
        // 3. Role-based Scope Enforcement
        if (authUser.role === constants_1.ROLES.EMPLOYEE) {
            if (activeAssignment.employeeId !== profile.id) {
                throw new AppError('You can only request return for assets currently assigned to you.', 403);
            }
        }
        else if (authUser.role === constants_1.ROLES.DEPARTMENT_MANAGER) {
            const isAssignedToManager = activeAssignment.employeeId === profile.id;
            const isAssignedInDepartment = activeAssignment.employee.departmentId === profile.departmentId;
            if (!isAssignedToManager && !isAssignedInDepartment) {
                throw new AppError('You can only request return for assets within your permitted department scope.', 403);
            }
        }
        // 4. Duplicate pending check
        const existingPending = await this.repo.findPendingByAssetId(asset.id);
        if (existingPending) {
            throw new AppError(`A return request for asset '${asset.assetCode}' is already pending review (${existingPending.requestNumber}).`, 409);
        }
        // 5. Generate sequential request number
        const requestNumber = await this.repo.generateRequestNumber();
        // 6. Create Return Request (status = PENDING)
        // Note: Asset status remains ASSIGNED, assignment remains active, inventory unchanged!
        const returnRequest = await this.repo.create({
            requestNumber,
            requester: { connect: { id: profile.id } },
            asset: { connect: { id: asset.id } },
            department: { connect: { id: activeAssignment.employee.departmentId || profile.departmentId } },
            status: client_1.ReturnRequestStatus.PENDING,
            reason: data.reason,
            notes: data.notes || null,
            requestedAt: new Date(),
        });
        // 7. Notify Store Keeper users
        const storeKeepers = await prisma_1.default.user.findMany({
            where: { role: constants_1.ROLES.STORE_KEEPER },
            select: { id: true },
        });
        if (storeKeepers.length > 0) {
            await (0, notifications_1.safeNotifyUsers)(storeKeepers.map((sk) => ({
                userId: sk.id,
                title: 'Asset Return Requested',
                message: `${profile.firstName} ${profile.lastName} requested to return ${asset.name} (${asset.assetCode}).`,
                type: 'INFO',
                link: '/store/returns',
            })));
        }
        return returnRequest;
    }
    /**
     * POST /api/returns/:id/receive - Store Keeper physically receives asset for a request
     * Path A fulfillment
     */
    async receiveReturn(authUser, requestId, data) {
        if (authUser.role !== constants_1.ROLES.STORE_KEEPER && authUser.role !== constants_1.ROLES.ADMIN) {
            throw new AppError('Only Store Keepers can physically receive asset returns.', 403);
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 1. Fetch return request
            const req = await tx.assetReturnRequest.findUnique({
                where: { id: requestId },
                include: {
                    asset: true,
                    requester: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!req) {
                throw new AppError('Return request not found', 404);
            }
            if (req.status !== client_1.ReturnRequestStatus.PENDING) {
                throw new AppError('This return has already been processed or is not pending.', 409);
            }
            // 2. Fetch asset
            const asset = await tx.asset.findUnique({
                where: { id: req.assetId },
            });
            if (!asset) {
                throw new AppError('Asset not found', 404);
            }
            if (asset.status !== client_1.AssetStatus.ASSIGNED) {
                throw new AppError(`Asset '${asset.assetCode}' is no longer in ASSIGNED status (currently ${asset.status}).`, 409);
            }
            // 3. Find active assignment
            const activeAssignment = await tx.assetAssignment.findFirst({
                where: {
                    assetId: asset.id,
                    isCurrent: true,
                },
                include: {
                    employee: {
                        include: {
                            user: true,
                        },
                    },
                },
            });
            if (!activeAssignment) {
                throw new AppError(`No active assignment record found for asset '${asset.assetCode}'.`, 404);
            }
            const returnDate = new Date();
            // 4. Close active assignment
            await tx.assetAssignment.update({
                where: { id: activeAssignment.id },
                data: {
                    returnedDate: returnDate,
                    isCurrent: false,
                    conditionOnReturn: data.conditionOnReturn || activeAssignment.conditionOnAssign || null,
                    notes: data.notes
                        ? activeAssignment.notes
                            ? `${activeAssignment.notes} | Return note: ${data.notes}`
                            : data.notes
                        : activeAssignment.notes,
                },
            });
            // 5. Update Asset: status = AVAILABLE, location = returnLocation
            await tx.asset.update({
                where: { id: asset.id },
                data: {
                    status: client_1.AssetStatus.AVAILABLE,
                    location: data.returnLocation,
                    ...(data.conditionOnReturn ? { condition: data.conditionOnReturn } : {}),
                },
            });
            // 6. Update AssetReturnRequest: status = RECEIVED
            const updatedReq = await tx.assetReturnRequest.update({
                where: { id: req.id },
                data: {
                    status: client_1.ReturnRequestStatus.RECEIVED,
                    receivedById: authUser.id,
                    receivedAt: returnDate,
                    conditionOnReturn: data.conditionOnReturn || null,
                    returnLocation: data.returnLocation,
                    notes: data.notes || null,
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
                    receivedBy: {
                        select: { id: true, email: true, role: true },
                    },
                },
            });
            return { updatedReq, asset, activeAssignment };
        });
        // 7. Notify the requester / former asset holder
        const holderUserId = result.activeAssignment.employee.user?.id || result.updatedReq.requester.user?.id;
        if (holderUserId) {
            await (0, notifications_1.safeNotifyUser)({
                userId: holderUserId,
                title: 'Asset Return Received',
                message: `${result.asset.assetCode} (${result.asset.name}) has been physically received by the Store Keeper and stored at ${data.returnLocation}.`,
                type: 'SUCCESS',
                link: '/my-assets',
            });
        }
        return result.updatedReq;
    }
    /**
     * POST /api/returns/walk-in - Store Keeper directly receives asset without prior request
     * Path B fulfillment
     */
    async receiveWalkInReturn(authUser, data) {
        if (authUser.role !== constants_1.ROLES.STORE_KEEPER && authUser.role !== constants_1.ROLES.ADMIN) {
            throw new AppError('Only Store Keepers can physically receive asset returns.', 403);
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 1. Fetch asset
            const asset = await tx.asset.findUnique({
                where: { id: data.assetId },
                include: { department: true },
            });
            if (!asset) {
                throw new AppError('Asset not found', 404);
            }
            // 2. Strict status check: Only ASSIGNED assets can be returned!
            if (asset.status !== client_1.AssetStatus.ASSIGNED) {
                throw new AppError(`Only currently ASSIGNED assets can be received as a return. Asset '${asset.assetCode}' is currently ${asset.status}.`, 422);
            }
            // 3. Find active assignment
            const activeAssignment = await tx.assetAssignment.findFirst({
                where: {
                    assetId: asset.id,
                    isCurrent: true,
                },
                include: {
                    employee: {
                        include: {
                            user: true,
                            department: true,
                        },
                    },
                },
            });
            if (!activeAssignment) {
                throw new AppError(`No active assignment record found for asset '${asset.assetCode}'.`, 404);
            }
            const returnDate = new Date();
            // 4. Close active assignment
            await tx.assetAssignment.update({
                where: { id: activeAssignment.id },
                data: {
                    returnedDate: returnDate,
                    isCurrent: false,
                    conditionOnReturn: data.conditionOnReturn,
                    notes: data.notes
                        ? activeAssignment.notes
                            ? `${activeAssignment.notes} | Walk-in return: ${data.notes}`
                            : `Walk-in return: ${data.notes}`
                        : activeAssignment.notes
                            ? `${activeAssignment.notes} | Walk-in return`
                            : 'Walk-in return',
                },
            });
            // 5. Update Asset status to AVAILABLE and set return location
            await tx.asset.update({
                where: { id: asset.id },
                data: {
                    status: client_1.AssetStatus.AVAILABLE,
                    location: data.returnLocation,
                    condition: data.conditionOnReturn,
                },
            });
            // 6. Check if there was an existing pending return request for this asset
            const pendingReq = await tx.assetReturnRequest.findFirst({
                where: {
                    assetId: asset.id,
                    status: client_1.ReturnRequestStatus.PENDING,
                },
            });
            let returnRecord;
            if (pendingReq) {
                returnRecord = await tx.assetReturnRequest.update({
                    where: { id: pendingReq.id },
                    data: {
                        status: client_1.ReturnRequestStatus.RECEIVED,
                        receivedById: authUser.id,
                        receivedAt: returnDate,
                        conditionOnReturn: data.conditionOnReturn,
                        returnLocation: data.returnLocation,
                        notes: data.notes ? `Walk-in return: ${data.notes}` : 'Walk-in return',
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
                        receivedBy: {
                            select: { id: true, email: true, role: true },
                        },
                    },
                });
            }
            else {
                // Create direct return record
                const currentYear = returnDate.getFullYear();
                const prefix = `RR-${currentYear}-`;
                const count = await tx.assetReturnRequest.count({
                    where: { requestNumber: { startsWith: prefix } },
                });
                const requestNumber = `${prefix}${(count + 1).toString().padStart(4, '0')}`;
                returnRecord = await tx.assetReturnRequest.create({
                    data: {
                        requestNumber,
                        requesterId: activeAssignment.employeeId,
                        assetId: asset.id,
                        departmentId: activeAssignment.employee.departmentId || asset.departmentId || '',
                        status: client_1.ReturnRequestStatus.RECEIVED,
                        reason: 'Direct / Walk-in Physical Return',
                        requestedAt: returnDate,
                        receivedById: authUser.id,
                        receivedAt: returnDate,
                        conditionOnReturn: data.conditionOnReturn,
                        returnLocation: data.returnLocation,
                        notes: data.notes || 'Walk-in return physically received by Store Keeper',
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
                        receivedBy: {
                            select: { id: true, email: true, role: true },
                        },
                    },
                });
            }
            return { returnRecord, asset, activeAssignment };
        });
        // 7. Notify former asset holder
        if (result.activeAssignment.employee.user?.id) {
            await (0, notifications_1.safeNotifyUser)({
                userId: result.activeAssignment.employee.user.id,
                title: 'Walk-in Return Received',
                message: `${result.asset.assetCode} (${result.asset.name}) has been physically received by the Store Keeper and stored at ${data.returnLocation}.`,
                type: 'SUCCESS',
                link: '/my-assets',
            });
        }
        return result.returnRecord;
    }
    /**
     * POST /api/returns/:id/cancel - Cancel pending return request
     */
    async cancelReturnRequest(authUser, id) {
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Return request not found', 404);
        }
        if (request.status !== client_1.ReturnRequestStatus.PENDING) {
            throw new AppError(`Cannot cancel return request with status '${request.status}'. Only PENDING requests can be cancelled.`, 422);
        }
        // Verify ownership
        if (authUser.role !== constants_1.ROLES.ADMIN) {
            const profile = await prisma_1.default.employeeProfile.findUnique({
                where: { userId: authUser.id },
            });
            if (!profile || request.requesterId !== profile.id) {
                throw new AppError('You can only cancel your own pending return requests', 403);
            }
        }
        return this.repo.update(id, {
            status: client_1.ReturnRequestStatus.CANCELLED,
        });
    }
    /**
     * GET /api/returns - List return requests with filters and pagination
     */
    async getReturnRequests(authUser, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Role-based scoping or personal filter
        if (query.personal === 'true' || authUser.role === constants_1.ROLES.EMPLOYEE || authUser.role === constants_1.ROLES.IT_TECHNICIAN) {
            const profile = await prisma_1.default.employeeProfile.findUnique({
                where: { userId: authUser.id },
            });
            if (profile) {
                where.requesterId = profile.id;
            }
            else {
                return {
                    returns: [],
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
        // Explicit filters
        if (query.status) {
            where.status = query.status;
        }
        if (query.assetId) {
            where.assetId = query.assetId;
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
                { reason: { contains: term, mode: 'insensitive' } },
                { notes: { contains: term, mode: 'insensitive' } },
                {
                    asset: {
                        OR: [
                            { assetCode: { contains: term, mode: 'insensitive' } },
                            { name: { contains: term, mode: 'insensitive' } },
                            { serialNumber: { contains: term, mode: 'insensitive' } },
                        ],
                    },
                },
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
        const { returns, total } = await this.repo.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            returns,
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
     * GET /api/returns/:id - Retrieve single return request details
     */
    async getReturnRequestById(authUser, id) {
        const request = await this.repo.findById(id);
        if (!request) {
            throw new AppError('Return request not found', 404);
        }
        // Access control
        if (authUser.role === constants_1.ROLES.ADMIN || authUser.role === constants_1.ROLES.STORE_KEEPER) {
            return request;
        }
        const profile = await prisma_1.default.employeeProfile.findUnique({
            where: { userId: authUser.id },
        });
        if (!profile) {
            throw new AppError('Access denied to this return request', 403);
        }
        if (request.requesterId === profile.id) {
            return request;
        }
        if (authUser.role === constants_1.ROLES.DEPARTMENT_MANAGER && request.departmentId === profile.departmentId) {
            return request;
        }
        throw new AppError('Access denied to this return request', 403);
    }
}
exports.ReturnService = ReturnService;
exports.returnService = new ReturnService();
//# sourceMappingURL=return.service.js.map