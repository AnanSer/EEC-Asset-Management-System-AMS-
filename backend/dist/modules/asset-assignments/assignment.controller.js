"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentController = exports.AssignmentController = void 0;
const assignment_service_1 = require("./assignment.service");
const assignment_validator_1 = require("./assignment.validator");
class AssignmentController {
    constructor(service = assignment_service_1.assignmentService) {
        this.service = service;
        this.getAll = async (req, res) => {
            try {
                const parsedQuery = assignment_validator_1.assignmentQuerySchema.parse(req.query);
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