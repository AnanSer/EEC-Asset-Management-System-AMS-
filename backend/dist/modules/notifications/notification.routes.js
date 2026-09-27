"use strict";
/**
 * Notification Routes — EEC EAMS (Phase 10B.1)
 * Express router for Enterprise Notification Center.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const middleware_1 = require("../../middleware");
const router = (0, express_1.Router)();
// All notification routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// GET /api/notifications/unread-count — returns unread notification count
router.get('/unread-count', (req, res) => notification_controller_1.notificationController.getUnreadCount(req, res));
// GET /api/notifications — list authenticated user notifications with pagination & filters
router.get('/', (req, res) => notification_controller_1.notificationController.getNotifications(req, res));
// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', (req, res) => notification_controller_1.notificationController.markAllAsRead(req, res));
// PATCH /api/notifications/:id/read — mark one notification as read
router.patch('/:id/read', (req, res) => notification_controller_1.notificationController.markAsRead(req, res));
// DELETE /api/notifications/read — delete all read notifications
router.delete('/read', (req, res) => notification_controller_1.notificationController.deleteReadNotifications(req, res));
// DELETE /api/notifications/:id — delete a notification
router.delete('/:id', (req, res) => notification_controller_1.notificationController.deleteNotification(req, res));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map