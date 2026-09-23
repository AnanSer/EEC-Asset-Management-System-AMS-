"use strict";
// EEC EAMS – Identity Module Controller (Phase 9A.2)
// Request handling and response formatting for authentication and account lifecycle.
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityController = exports.IdentityController = void 0;
const identity_service_1 = require("./identity.service");
const identity_validator_1 = require("./identity.validator");
class IdentityController {
    constructor(service = identity_service_1.identityService) {
        this.service = service;
        /**
         * POST /api/identity/register
         * Submit an employee registration request.
         */
        this.register = async (req, res) => {
            try {
                const validatedData = identity_validator_1.registrationSchema.parse(req.body);
                const result = await this.service.register(validatedData);
                return res.status(201).json({
                    success: true,
                    message: result.message,
                    data: result.user,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        /**
         * GET /api/identity/pending
         * List pending account requests awaiting approval.
         */
        this.getPending = async (req, res) => {
            try {
                const parsedQuery = identity_validator_1.pendingUserQuerySchema.parse(req.query);
                const { users, meta } = await this.service.getPendingUsers(parsedQuery);
                return res.status(200).json({
                    success: true,
                    data: users,
                    meta,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        /**
         * PATCH /api/identity/:id/approve
         * Approve a pending user account.
         */
        this.approve = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = identity_validator_1.approvalSchema.parse(req.body);
                const result = await this.service.approveAccount(id, validatedData);
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.user,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        /**
         * PATCH /api/identity/:id/reject
         * Reject a pending user account.
         */
        this.reject = async (req, res) => {
            try {
                const id = String(req.params.id);
                const validatedData = identity_validator_1.rejectionSchema.parse(req.body);
                const result = await this.service.rejectAccount(id, validatedData);
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    reason: result.reason,
                    data: result.user,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
        /**
         * PATCH /api/identity/:id/suspend
         * Suspend a user account.
         */
        this.suspend = async (req, res) => {
            try {
                const id = String(req.params.id);
                const result = await this.service.suspendAccount(id);
                return res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.user,
                });
            }
            catch (err) {
                return this.handleError(res, err);
            }
        };
    }
    handleError(res, err) {
        if (err instanceof identity_service_1.AppError) {
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
        console.error('Unhandled Identity Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
exports.IdentityController = IdentityController;
exports.identityController = new IdentityController();
//# sourceMappingURL=identity.controller.js.map