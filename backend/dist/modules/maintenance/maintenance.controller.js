"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceController = exports.MaintenanceController = void 0;
const maintenance_service_1 = require("./maintenance.service");
const maintenance_validator_1 = require("./maintenance.validator");
const zod_1 = require("zod");
class MaintenanceController {
    handleError(res, error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        if (error instanceof maintenance_service_1.AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        const err = error;
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
        });
    }
    async getTickets(req, res) {
        try {
            const validatedQuery = maintenance_validator_1.maintenanceQuerySchema.parse(req.query);
            const result = await maintenance_service_1.maintenanceService.getTickets(validatedQuery);
            return res.status(200).json({
                success: true,
                data: result.tickets,
                meta: result.meta,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getTicketById(req, res) {
        try {
            const id = String(req.params.id);
            const ticket = await maintenance_service_1.maintenanceService.getTicketById(id);
            return res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async createTicket(req, res) {
        try {
            const validatedData = maintenance_validator_1.createMaintenanceSchema.parse(req.body);
            const ticket = await maintenance_service_1.maintenanceService.createTicket(validatedData);
            return res.status(201).json({
                success: true,
                message: 'Maintenance ticket created successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async updateTicket(req, res) {
        try {
            const id = String(req.params.id);
            const validatedData = maintenance_validator_1.updateMaintenanceSchema.parse(req.body);
            const ticket = await maintenance_service_1.maintenanceService.updateTicket(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Maintenance ticket updated successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async updateStatus(req, res) {
        try {
            const id = String(req.params.id);
            const validatedData = maintenance_validator_1.updateMaintenanceStatusSchema.parse(req.body);
            const ticket = await maintenance_service_1.maintenanceService.updateStatus(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Maintenance ticket status updated successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await maintenance_service_1.maintenanceService.getDashboardStats();
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
exports.maintenanceController = new MaintenanceController();
//# sourceMappingURL=maintenance.controller.js.map