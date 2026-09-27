/**
 * Notification Controller — EEC EAMS (Phase 10B.1)
 * Handles HTTP requests for Enterprise Notification Center.
 */

import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import {
  notificationService,
  NotificationService,
  AppError,
} from './notification.service';
import {
  notificationQuerySchema,
  notificationIdParamSchema,
} from './notification.validator';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
} from '../../lib/api/apiResponse';

export class NotificationController {
  constructor(private service: NotificationService = notificationService) {}

  /**
   * Resolve business User ID from Better Auth session.
   * Ensures strict user scoping with zero ownership bypass.
   */
  private async resolveUserId(req: Request): Promise<string> {
    if (!req.auth?.user) {
      throw new AppError('Unauthorized: Authentication required', 401);
    }

    const businessUser = await prisma.user.findFirst({
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
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const query = notificationQuerySchema.parse(req.query);

      const result = await this.service.listNotifications(userId, query);

      return res
        .status(200)
        .json(
          paginatedResponse(
            result.notifications,
            result.pagination,
            'Notifications retrieved successfully'
          )
        );
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode, error.errors));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to retrieve notifications', 400));
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Returns count of unread notifications for the authenticated user
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const result = await this.service.unreadCount(userId);

      return res
        .status(200)
        .json(successResponse(result, null, 'Unread count retrieved successfully'));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to get unread count', 400));
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const { id } = notificationIdParamSchema.parse(req.params);

      const result = await this.service.readNotification(id, userId);

      return res
        .status(200)
        .json(successResponse(result, null, 'Notification marked as read'));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to mark notification as read', 400));
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all unread notifications as read
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const result = await this.service.readAllNotifications(userId);

      return res
        .status(200)
        .json(successResponse(result, null, 'All notifications marked as read'));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to mark all as read', 400));
    }
  }

  /**
   * DELETE /api/notifications/read
   * Delete all read notifications for the authenticated user
   */
  async deleteReadNotifications(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const result = await this.service.clearReadNotifications(userId);

      return res
        .status(200)
        .json(successResponse(result, null, 'Read notifications cleared successfully'));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to clear read notifications', 400));
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = await this.resolveUserId(req);
      const { id } = notificationIdParamSchema.parse(req.params);

      const result = await this.service.removeNotification(id, userId);

      return res
        .status(200)
        .json(successResponse(result, null, 'Notification deleted successfully'));
    } catch (error: any) {
      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(errorResponse(error.message, error.statusCode));
      }
      return res
        .status(400)
        .json(errorResponse(error.message || 'Failed to delete notification', 400));
    }
  }
}

export const notificationController = new NotificationController();
