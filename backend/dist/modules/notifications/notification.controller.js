"use strict";
/**
 * Notification Controller — EEC EAMS (Phase 10B.1)
 * Handles HTTP requests for Enterprise Notification Center.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const notification_service_1 = require("./notification.service");
const notification_validator_1 = require("./notification.validator");
const apiResponse_1 = require("../../lib/api/apiResponse");
class NotificationController {
    constructor(service = notification_service_1.notificationService) {
        this.service = service;
    }
    /**
     * Resolve business User ID from Better Auth session.
     * Ensures strict user scoping with zero ownership bypass.
     */
    async resolveUserId(req) {
        if (!req.auth?.user) {
            throw new notification_service_1.AppError('Unauthorized: Authentication required', 401);
        }
        const businessUser = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }],
            },
        });
        return businessUser?.id || req.auth.user.id;
    }
    /**
     * GET /api/notifications
     * List paginated notifications for the authenticated user
     */
    async getNotifications(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const query = notification_validator_1.notificationQuerySchema.parse(req.query);
            const result = await this.service.listNotifications(userId, query);
            return res
                .status(200)
                .json((0, apiResponse_1.paginatedResponse)(result.notifications, result.pagination, 'Notifications retrieved successfully'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode, error.errors));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to retrieve notifications', 400));
        }
    }
    /**
     * GET /api/notifications/unread-count
     * Returns count of unread notifications for the authenticated user
     */
    async getUnreadCount(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const result = await this.service.unreadCount(userId);
            return res
                .status(200)
                .json((0, apiResponse_1.successResponse)(result, null, 'Unread count retrieved successfully'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to get unread count', 400));
        }
    }
    /**
     * PATCH /api/notifications/:id/read
     * Mark a single notification as read
     */
    async markAsRead(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const { id } = notification_validator_1.notificationIdParamSchema.parse(req.params);
            const result = await this.service.readNotification(id, userId);
            return res
                .status(200)
                .json((0, apiResponse_1.successResponse)(result, null, 'Notification marked as read'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to mark notification as read', 400));
        }
    }
    /**
     * PATCH /api/notifications/read-all
     * Mark all unread notifications as read
     */
    async markAllAsRead(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const result = await this.service.readAllNotifications(userId);
            return res
                .status(200)
                .json((0, apiResponse_1.successResponse)(result, null, 'All notifications marked as read'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to mark all as read', 400));
        }
    }
    /**
     * DELETE /api/notifications/read
     * Delete all read notifications for the authenticated user
     */
    async deleteReadNotifications(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const result = await this.service.clearReadNotifications(userId);
            return res
                .status(200)
                .json((0, apiResponse_1.successResponse)(result, null, 'Read notifications cleared successfully'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to clear read notifications', 400));
        }
    }
    /**
     * DELETE /api/notifications/:id
     * Delete a notification
     */
    async deleteNotification(req, res) {
        try {
            const userId = await this.resolveUserId(req);
            const { id } = notification_validator_1.notificationIdParamSchema.parse(req.params);
            const result = await this.service.removeNotification(id, userId);
            return res
                .status(200)
                .json((0, apiResponse_1.successResponse)(result, null, 'Notification deleted successfully'));
        }
        catch (error) {
            if (error instanceof notification_service_1.AppError) {
                return res
                    .status(error.statusCode)
                    .json((0, apiResponse_1.errorResponse)(error.message, error.statusCode));
            }
            return res
                .status(400)
                .json((0, apiResponse_1.errorResponse)(error.message || 'Failed to delete notification', 400));
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map