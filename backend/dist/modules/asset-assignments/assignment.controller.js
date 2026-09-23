"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentController = exports.AssignmentController = void 0;
const assignment_service_1 = require("./assignment.service");
const assignment_validator_1 = require("./assignment.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const constants_1 = require("../../constants");
const authorization_1 = require("../../lib/authorization");
class AssignmentController {
    constructor(service = assignment_service_1.assignmentService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = assignment_validator_1.assignmentQuerySchema.parse(req.query);
                // Scoped access based on authenticated user role
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const role = user.role;
                        // DEPARTMENT_MANAGER: View assignments belonging to own department
                        if (role === constants_1.ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
                            parsedQuery.departmentId = user.employeeProfile.departmentId;
                        }
                        // EMPLOYEE: View assignment history for own assigned assets only
                        if (role === constants_1.ROLES.EMPLOYEE) {
                            if (user.employeeProfile) {
                                parsedQuery.employeeId = user.employeeProfile.id;
                            }
                            else {
                                return res.status(200).json({
                                    success: true,
                                    data: [],
                                    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
                                });
                            }
                        }
                    }
                }
                const { assignments, meta } = await this.service.getAssignments(parsedQuery);
                return res.status(200).json({
                    success: true,
                    data: assignments,
                    meta,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = String(req.params.id);
                const assignment = await this.service.getAssignmentById(id);
                if (!assignment) {
                    return res.status(404).json({
                        success: false,
                        message: 'Assignment not found',
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: assignment,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getHistory = async (req, res) => {
            try {
                const assetId = String(req.params.assetId);
                // Check whether user can access this asset's history
                if (req.auth?.user) {
                    const user = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                        include: { employeeProfile: true },
                    });
                    if (user) {
                        const asset = await prisma_1.default.asset.findUnique({
                            where: { id: assetId },
                            include: { assignments: { where: { isCurrent: true } } },
                        });
                        if (!asset) {
                            return res.status(404).json({
                                success: false,
                                message: 'Asset not found',
                            });
                        }
                        const authContext = {
                            userId: user.id,
                            role: user.role,
                            departmentId: user.employeeProfile?.departmentId,
                            employeeProfileId: user.employeeProfile?.id,
                            employeeId: user.employeeProfile?.employeeId,
                        };
                        const allowed = (0, authorization_1.canAccessAsset)(authContext, {
                            id: asset.id,
                            departmentId: asset.departmentId,
                            assignments: asset.assignments,
                        });
                        if (!allowed) {
                            return res.status(403).json({
                                success: false,
                                message: 'Forbidden: You do not have permission to view assignment history for this asset',
                            });
                        }
                    }
                }
                const history = await this.service.getAssetHistory(assetId);
                return res.status(200).json({
                    success: true,
                    data: history,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.assign = async (req, res) => {
            try {
                const validatedData = assignment_validator_1.assignAssetSchema.parse(req.body);
                const newAssignment = await this.service.assignAsset(validatedData);
                return res.status(201).json({
                    success: true,
                    message: 'Asset assigned successfully',
                    data: newAssignment,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.transfer = async (req, res) => {
            try {
                const assetId = String(req.params.assetId);
                const validatedData = assignment_validator_1.transferAssetSchema.parse(req.body);
                const updatedAssignment = await this.service.transferAsset(assetId, validatedData);
                return res.status(200).json({
                    success: true,
                    message: 'Asset transferred successfully',
                    data: updatedAssignment,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.returnAsset = async (req, res) => {
            try {
                const assetId = String(req.params.assetId);
                const validatedData = assignment_validator_1.returnAssetSchema.parse(req.body);
                const closedAssignment = await this.service.returnAsset(assetId, validatedData);
                return res.status(200).json({
                    success: true,
                    message: 'Asset returned successfully',
                    data: closedAssignment,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getStats = async (_req, res) => {
            try {
                const stats = await this.service.getDashboardStats();
                return res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof assignment_service_1.AppError) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message,
                errors: err.errors,
            });
        }
        if (err?.name === 'ZodError') {
            const formattedErrors = err.issues?.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors,
            });
        }
        console.error('Unhandled Assignment Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
exports.AssignmentController = AssignmentController;
exports.assignmentController = new AssignmentController();
//# sourceMappingURL=assignment.controller.js.map