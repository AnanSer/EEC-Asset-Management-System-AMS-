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
const api_1 = require("../../lib/api");
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
                                return res.status(200).json((0, api_1.paginatedResponse)([], (0, api_1.buildPagination)(1, 10, 0)));
                            }
                        }
                    }
                }
                const { assignments, meta } = await this.service.getAssignments(parsedQuery);
                const pagination = (0, api_1.buildPagination)(meta.page, meta.limit, meta.total);
                return res.status(200).json((0, api_1.paginatedResponse)(assignments, pagination));
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
                    return res.status(404).json((0, api_1.errorResponse)('Assignment not found'));
                }
                return res.status(200).json((0, api_1.successResponse)(assignment));
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
                            return res.status(404).json((0, api_1.errorResponse)('Asset not found'));
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
                            return res.status(403).json((0, api_1.errorResponse)('Forbidden: You do not have permission to view assignment history for this asset'));
                        }
                    }
                }
                const history = await this.service.getAssetHistory(assetId);
                return res.status(200).json((0, api_1.successResponse)(history));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.assign = async (req, res) => {
            try {
                const validatedData = assignment_validator_1.assignAssetSchema.parse(req.body);
                const newAssignment = await this.service.assignAsset(validatedData);
                return res.status(201).json((0, api_1.createdResponse)(newAssignment, null, 'Asset assigned successfully'));
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
                return res.status(200).json((0, api_1.successResponse)(updatedAssignment, null, 'Asset transferred successfully'));
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
                return res.status(200).json((0, api_1.successResponse)(closedAssignment, null, 'Asset returned successfully'));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        this.getStats = async (_req, res) => {
            try {
                const stats = await this.service.getDashboardStats();
                return res.status(200).json((0, api_1.successResponse)(stats));
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof assignment_service_1.AppError) {
            return res.status(err.statusCode).json((0, api_1.errorResponse)(err.message, err.statusCode, err.errors));
        }
        if (err?.name === 'ZodError') {
            const formattedErrors = err.issues?.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return res.status(422).json((0, api_1.errorResponse)('Validation failed', 422, formattedErrors));
        }
        console.error('Unhandled Assignment Error:', err);
        return res.status(500).json((0, api_1.errorResponse)('Internal server error'));
    }
}
exports.AssignmentController = AssignmentController;
exports.assignmentController = new AssignmentController();
//# sourceMappingURL=assignment.controller.js.map