"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingController = exports.TestingController = void 0;
const testing_service_1 = require("./testing.service");
const testing_validator_1 = require("./testing.validator");
const zod_1 = require("zod");
const api_1 = require("../../lib/api");
class TestingController {
    handleError(res, error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json((0, api_1.errorResponse)('Validation failed', 'VALIDATION_ERROR', error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))));
        }
        if (error instanceof testing_service_1.AppError) {
            return res.status(error.statusCode).json((0, api_1.errorResponse)(error.message, 'APP_ERROR', error.errors));
        }
        const err = error;
        return res.status(500).json((0, api_1.errorResponse)(err.message || 'Internal server error', 'INTERNAL_ERROR'));
    }
    async getInspectionsByTicket(req, res) {
        try {
            const ticketId = String(req.params.ticketId);
            const inspections = await testing_service_1.testingService.getInspectionsByTicket(ticketId);
            return res.status(200).json((0, api_1.successResponse)(inspections));
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async createInspection(req, res) {
        try {
            const validatedData = testing_validator_1.createInspectionSchema.parse(req.body);
            const inspection = await testing_service_1.testingService.createInspection(validatedData);
            return res.status(201).json((0, api_1.createdResponse)(inspection, undefined, 'Inspection test recorded successfully'));
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async updateInspection(req, res) {
        try {
            const id = String(req.params.id);
            const validatedData = testing_validator_1.updateInspectionSchema.parse(req.body);
            const inspection = await testing_service_1.testingService.updateInspection(id, validatedData);
            return res.status(200).json((0, api_1.successResponse)(inspection, undefined, 'Inspection test updated successfully'));
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
}
exports.TestingController = TestingController;
exports.testingController = new TestingController();
//# sourceMappingURL=testing.controller.js.map