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
                        // Personal view: View only assets currently assigned to logged-in user (Employee or Manager)
                        if (isPersonal) {
                            if (user.employeeProfile) {
                                const activeAssignments = await prisma_1.default.assetAssignment.findMany({
                                    where: {
                                        employeeId: user.employeeProfile.id,
                                        isCurrent: true,
                                    },
                                    include: {
                                        asset: {
                                            include: {
                                                department: { select: { id: true, code: true, name: true } },
                                                assignments: {
                                                    where: { isCurrent: true },
                                                    include: {
                                                        employee: {
                                                            select: { id: true, employeeId: true, firstName: true, lastName: true },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                });
                                const userAssets = activeAssignments.map((a) => a.asset);
                                return res.status(200).json((0, api_1.paginatedResponse)(userAssets, (0, api_1.buildPagination)(1, 10, userAssets.length)));
                            }
                            else {
                                return res.status(200).json((0, api_1.paginatedResponse)([], (0, api_1.buildPagination)(1, 10, 0)));
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
                        const allowed = (0, authorization_1.canAccessAsset)(authContext, asset);
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