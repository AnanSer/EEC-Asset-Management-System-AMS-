/**
 * Notification Controller — EEC EAMS (Phase 10B.1)
 * Handles HTTP requests for Enterprise Notification Center.
 */
import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
export declare class NotificationController {
    private service;
    constructor(service?: NotificationService);
    /**
     * Resolve business User ID from Better Auth session.
     * Ensures strict user scoping with zero ownership bypass.
     */
    private resolveUserId;
    /**
     * GET /api/notifications
     * List paginated notifications for the authenticated user
     */
    getNotifications(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/notifications/unread-count
     * Returns count of unread notifications for the authenticated user
     */
    getUnreadCount(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/notifications/:id/read
     * Mark a single notification as read
     */
    markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/notifications/read-all
     * Mark all unread notifications as read
     */
    markAllAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/notifications/read
     * Delete all read notifications for the authenticated user
     */
    deleteReadNotifications(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/notifications/:id
     * Delete a notification
     */
    deleteNotification(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map