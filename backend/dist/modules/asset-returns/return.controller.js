"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnController = exports.ReturnController = void 0;
const return_service_1 = require("./return.service");
const return_validator_1 = require("./return.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class ReturnController {
    async getAuthContext(req) {
        const user = req.auth?.user;
        if (!user) {
            throw new return_service_1.AppError('Unauthorized', 401);
        }
        let role = user.role;
        let userId = user.id;
        if (!role || !userId) {
            const businessUser = await prisma_1.default.user.findFirst({
                where: {
                    OR: [{ id: user.id }, { email: user.email }],
                },
                select: { id: true, email: true, role: true },
            });
            if (businessUser) {
                role = businessUser.role;
                userId = businessUser.id;
            }
        }
        return {
            id: userId,
            email: user.email,
            role,
        };
    }
    /**
     * POST /api/returns - Create a return request
     */
    async create(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const parsed = return_validator_1.createReturnRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const returnRequest = await return_service_1.returnService.createReturnRequest(authUser, parsed.data);
            return res.status(201).json({
                success: true,
                message: 'Asset return request submitted successfully',
                data: returnRequest,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/returns/:id/receive - Store Keeper receives physical asset for a request
     */
    async receive(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const parsed = return_validator_1.receiveReturnSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const updated = await return_service_1.returnService.receiveReturn(authUser, id, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Asset physically received and returned to store inventory',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/returns/walk-in - Store Keeper directly receives asset without request
     */
    async receiveWalkIn(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const parsed = return_validator_1.walkInReturnSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const updated = await return_service_1.returnService.receiveWalkInReturn(authUser, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Walk-in asset physically received and returned to store inventory',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/returns/:id/cancel - Cancel pending return request
     */
    async cancel(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const updated = await return_service_1.returnService.cancelReturnRequest(authUser, id);
            return res.status(200).json({
                success: true,
                message: 'Asset return request cancelled',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * GET /api/returns - List return requests
     */
    async getAll(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const parsed = return_validator_1.returnQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: parsed.error.format(),
                });
            }
            const result = await return_service_1.returnService.getReturnRequests(authUser, parsed.data);
            return res.status(200).json({
                success: true,
                data: result.returns,
                meta: result.meta,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * GET /api/returns/:id - Get single return request
     */
    async getById(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const request = await return_service_1.returnService.getReturnRequestById(authUser, id);
            return res.status(200).json({
                success: true,
                data: request,
            });
        }
        catch (err) {
            const status = err instanceof return_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
}
exports.ReturnController = ReturnController;
exports.returnController = new ReturnController();
//# sourceMappingURL=return.controller.js.map