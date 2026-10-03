"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetController = exports.AssetController = void 0;
const asset_service_1 = require("./asset.service");
const asset_validator_1 = require("./asset.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const constants_1 = require("../../constants");
const authorization_1 = require("../../lib/authorization");
const api_1 = require("../../lib/api");
class AssetController {
    constructor(service = asset_service_1.assetService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = asset_validator_1.assetQuerySchema.parse(req.query);
                // Scoped access based on authenticated user role
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const role = user.role;
                        const isPersonal = parsedQuery.personal === 'true' || parsedQuery.personal === true || role === constants_1.ROLES.EMPLOYEE;
                        // Personal view: View assets assigned or previously assigned (returned) to logged-in user
                        if (isPersonal) {
                            if (user.employeeProfile) {
                                const allEmployeeAssignments = await prisma_1.default.assetAssignment.findMany({
                                    where: {
                                        employeeId: user.employeeProfile.id,
                                    },
                                    orderBy: {
                                        assignedDate: 'desc',
                                    },
                                    include: {
                                        asset: {
                                            include: {
                                                department: { select: { id: true, code: true, name: true } },
                                                assignments: {
                                                    where: { employeeId: user.employeeProfile.id },
                                                    orderBy: { assignedDate: 'desc' },
                                                    take: 5,
                                                    include: {
                                                        employee: {
                                                            select: { id: true, employeeId: true, firstName: true, lastName: true },
                                                        },
                                                    },
                                                },
                                                returnRequests: {
                                                    where: { status: 'RECEIVED' },
                                                    orderBy: { receivedAt: 'desc' },
                                                    take: 1,
                                                    include: {
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
                                                },
                                            },
                                        },
                                    },
                                });
                                // Deduplicate by assetId: preserve current active assignment over past returned assignment
                                const assetMap = new Map();
                                for (const asgn of allEmployeeAssignments) {
                                    if (!assetMap.has(asgn.assetId)) {
                                        assetMap.set(asgn.assetId, asgn);
                                    }
                                    else if (asgn.isCurrent) {
                                        assetMap.set(asgn.assetId, asgn);
                                    }
                                }
                                let userAssets = Array.from(assetMap.values()).map((asgn) => {
                                    const baseAsset = asgn.asset;
                                    const isCurrent = asgn.isCurrent;
                                    const custodyStatus = isCurrent ? 'ASSIGNED' : 'RETURNED';
                                    const returnReq = baseAsset.returnRequests?.[0];
                                    const receiverName = returnReq?.receivedBy?.employeeProfile
                                        ? `${returnReq.receivedBy.employeeProfile.firstName} ${returnReq.receivedBy.employeeProfile.lastName}`
                                        : returnReq?.receivedBy?.email || 'Store Keeper';
                                    return {
                                        ...baseAsset,
                                        custodyStatus,
                                        currentAssignment: isCurrent
                                            ? {
                                                id: asgn.id,
                                                employeeId: asgn.employeeId,
                                                employeeName: `${user.employeeProfile?.firstName} ${user.employeeProfile?.lastName}`,
                                                departmentName: baseAsset.department?.name,
                                                assignedDate: asgn.assignedDate,
                                                remarks: asgn.notes,
                                                isCurrent: true,
                                            }
                                            : null,
                                        returnedAssignment: !isCurrent
                                            ? {
                                                id: asgn.id,
                                                employeeId: asgn.employeeId,
                                                assignedDate: asgn.assignedDate,
                                                returnedDate: asgn.returnedDate,
                                                conditionOnReturn: asgn.conditionOnReturn,
                                                notes: asgn.notes,
                                                isCurrent: false,
                                                receivedBy: receiverName,
                                                receivedByEmail: returnReq?.receivedBy?.email || null,
                                            }
                                            : null,
                                    };
                                });
                                // Filter by status if provided (supports 'ASSIGNED', 'RETURNED', or regular asset status)
                                if (parsedQuery.status && parsedQuery.status !== 'all') {
                                    if (parsedQuery.status === 'ASSIGNED') {
                                        userAssets = userAssets.filter((a) => a.custodyStatus === 'ASSIGNED');
                                    }
                                    else if (parsedQuery.status === 'RETURNED') {
                                        userAssets = userAssets.filter((a) => a.custodyStatus === 'RETURNED');
                                    }
                                    else {
                                        userAssets = userAssets.filter((a) => a.status === parsedQuery.status);
                                    }
                                }
                                return res.status(200).json((0, api_1.paginatedResponse)(userAssets, (0, api_1.buildPagination)(1, 50, userAssets.length)));
                            }
                            else {
                                return res.status(200).json((0, api_1.paginatedResponse)([], (0, api_1.buildPagination)(1, 50, 0)));
                            }
                        }
                        // DEPARTMENT_MANAGER: View only assets inside own department
                        if (role === constants_1.ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
                            parsedQuery.departmentId = user.employeeProfile.departmentId;
                        }
                    }
                }
                const { assets, meta } = await this.service.getAssets(parsedQuery);
                const pagination = (0, api_1.buildPagination)(meta.page, meta.limit, meta.total);
                return res.status(200).json((0, api_1.paginatedResponse)(assets, pagination));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = String(req.params.id);
                const asset = await this.service.getAssetById(id);
                if (!asset) {
                    return res.status(404).json((0, api_1.errorResponse)('Asset not found'));
                }
                // Check ownership & department access
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const authContext = {
                            userId: user.id,
                            role: user.role,
                            departmentId: user.employeeProfile?.departmentId,
                            employeeProfileId: user.employeeProfile?.id,
                            employeeId: user.employeeProfile?.employeeId,
                            name: user.employeeProfile
                                ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`.trim()
                                : null,
                        };
                        let allowed = (0, authorization_1.canAccessAsset)(authContext, asset);
                        // Allow employee to view asset if they are currently assigned or were previously assigned this asset (returned custody)
                        if (!allowed && user.role === constants_1.ROLES.EMPLOYEE && user.employeeProfile?.id) {
                            const hasAssignment = await prisma_1.default.assetAssignment.findFirst({
                                where: {
                                    assetId: id,
                                    employeeId: user.employeeProfile.id,
                                },
                            });
                            if (hasAssignment) {
                                allowed = true;
                            }
                        }
                        if (!allowed) {
                            return res.status(403).json((0, api_1.errorResponse)('Forbidden: You do not have permission to view this asset'));
                        }
                    }
                }
                return res.status(200).json((0, api_1.successResponse)(asset));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.create = async (req, res) => {
            try {
                const validatedData = asset_validator_1.createAssetSchema.parse(req.body);
                const newAsset = await this.service.createAsset(validatedData);
                return res.status(201).json((0, api_1.createdResponse)(newAsset, null, 'Asset registered successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.update = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = asset_validator_1.updateAssetSchema.parse(req.body);
                const updated = await this.service.updateAsset(id, validatedData);
                return res.status(200).json((0, api_1.successResponse)(updated, null, 'Asset updated successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.updateStatus = async (req, res) => {
            try {
                const id = String(req.params.id);
                const { status } = asset_validator_1.updateAssetStatusSchema.parse(req.body);
                const updated = await this.service.updateStatus(id, status);
                return res.status(200).json((0, api_1.successResponse)(updated, null, `Asset status updated to '${status}'`));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.updateLocation = async (req, res) => {
            try {
                const id = String(req.params.id);
                const { location } = asset_validator_1.updateAssetLocationSchema.parse(req.body);
                const updated = await this.service.updateLocation(id, location ?? null);
                return res.status(200).json((0, api_1.successResponse)(updated, null, 'Asset location updated successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getInventory = async (req, res) => {
            try {
                let departmentId = undefined;
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const role = user.role;
                        // Security Guard: EMPLOYEES are strictly forbidden from organization inventory
                        if (role === constants_1.ROLES.EMPLOYEE) {
                            return res.status(403).json((0, api_1.errorResponse)('Forbidden: Employees cannot access organization inventory', 403));
                        }
                        // Department Managers only see inventory in their assigned department
                        if (role === constants_1.ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
                            departmentId = user.employeeProfile.departmentId;
                        }
                    }
                }
                const inventory = await this.service.getInventory(departmentId);
                return res.status(200).json((0, api_1.successResponse)(inventory));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof asset_service_1.AppError) {
            return res.status(err.statusCode).json((0, api_1.errorResponse)(err.message, err.statusCode, err.errors));
        }
        if (err?.name === 'ZodError') {
            const formattedErrors = err.issues?.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(422).json((0, api_1.errorResponse)('Validation failed', 422, formattedErrors));
        }
        console.error('Unhandled Asset Error:', err);
        return res.status(500).json((0, api_1.errorResponse)('Internal server error'));
    }
}
exports.AssetController = AssetController;
exports.assetController = new AssetController();
//# sourceMappingURL=asset.controller.js.map