/**
 * Notification Routes — EEC EAMS (Phase 10B.1)
 * Express router for Enterprise Notification Center.
 */

import { Router } from 'express';
import { notificationController } from './notification.controller';
import { requireAuth } from '../../middleware';

const router = Router();

// All notification routes require an authenticated session
router.use(requireAuth());

// GET /api/notifications/unread-count — returns unread notification count
router.get('/unread-count', (req, res) =>
  notificationController.getUnreadCount(req, res)
);

// GET /api/notifications — list authenticated user notifications with pagination & filters
router.get('/', (req, res) =>
  notificationController.getNotifications(req, res)
);

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', (req, res) =>
  notificationController.markAllAsRead(req, res)
);

// PATCH /api/notifications/:id/read — mark one notification as read
router.patch('/:id/read', (req, res) =>
  notificationController.markAsRead(req, res)
);

// DELETE /api/notifications/read — delete all read notifications
router.delete('/read', (req, res) =>
  notificationController.deleteReadNotifications(req, res)
);

// DELETE /api/notifications/:id — delete a notification
router.delete('/:id', (req, res) =>
  notificationController.deleteNotification(req, res)
);

export default router;
