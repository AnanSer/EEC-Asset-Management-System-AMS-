"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestController = exports.RequestController = void 0;
const request_service_1 = require("./request.service");
const request_validator_1 = require("./request.validator");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class RequestController {
    /**
     * Helper to extract business role and user id from auth session
     */
    async getAuthContext(req) {
        const user = req.auth?.user;
        if (!user) {
            throw new request_service_1.AppError('Unauthorized', 401);
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
     * POST /api/requests - Create a new asset request
     */
    async create(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const parsed = request_validator_1.createRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const request = await request_service_1.requestService.createRequest(authUser, parsed.data);
            return res.status(201).json({
                success: true,
                message: 'Asset request submitted successfully',
                data: request,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * GET /api/requests - List requests with filtering and pagination
     */
    async getAll(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const parsed = request_validator_1.requestQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: parsed.error.format(),
                });
            }
            const result = await request_service_1.requestService.getRequests(authUser, parsed.data);
            return res.status(200).json({
                success: true,
                data: result.requests,
                meta: result.meta,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * GET /api/requests/:id - Retrieve single request
     */
    async getById(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const request = await request_service_1.requestService.getRequestById(authUser, id);
            return res.status(200).json({
                success: true,
                data: request,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/requests/:id/approve - Approve asset request (ADMIN only)
     */
    async approve(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const parsed = request_validator_1.approveRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const updated = await request_service_1.requestService.approveRequest(authUser, id, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Asset request approved successfully',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/requests/:id/reject - Reject asset request (ADMIN only)
     */
    async reject(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const parsed = request_validator_1.rejectRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const updated = await request_service_1.requestService.rejectRequest(authUser, id, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Asset request rejected',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/requests/:id/fulfill - Fulfill asset request with physical handover (STORE_KEEPER / ADMIN)
     */
    async fulfill(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const parsed = request_validator_1.fulfillRequestSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsed.error.format(),
                });
            }
            const updated = await request_service_1.requestService.fulfillRequest(authUser, id, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Asset request physically fulfilled and assigned',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
    /**
     * POST /api/requests/:id/cancel - Cancel pending request
     */
    async cancel(req, res) {
        try {
            const authUser = await this.getAuthContext(req);
            const id = req.params.id;
            const updated = await request_service_1.requestService.cancelRequest(authUser, id);
            return res.status(200).json({
                success: true,
                message: 'Asset request cancelled',
                data: updated,
            });
        }
        catch (err) {
            const status = err instanceof request_service_1.AppError ? err.statusCode : 500;
            return res.status(status).json({
                success: false,
                message: err.message || 'Internal server error',
            });
        }
    }
}
exports.RequestController = RequestController;
exports.requestController = new RequestController();
//# sourceMappingURL=request.controller.js.map