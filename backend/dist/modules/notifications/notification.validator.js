"use strict";
/**
 * Notification Validation Schemas — EEC EAMS (Phase 10B.1)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdParamSchema = exports.notificationQuerySchema = exports.createManyNotificationsSchema = exports.createNotificationSchema = exports.notificationTypes = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.notificationTypes = [
    'INFO',
    'SUCCESS',
    'WARNING',
    'ERROR',
    'MAINTENANCE',
    'TESTING',
    'ACCOUNT',
    'WARRANTY',
];
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    message: zod_1.z.string().min(1, 'Message is required'),
    type: zod_1.z.nativeEnum(client_1.NotificationType),
    link: zod_1.z.string().nullable().optional(),
});
exports.createManyNotificationsSchema = zod_1.z.array(exports.createNotificationSchema);
exports.notificationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    type: zod_1.z.string().optional(),
    isRead: zod_1.z
        .preprocess((val) => {
        if (val === 'true' || val === true)
            return true;
        if (val === 'false' || val === false)
            return false;
        return undefined;
    }, zod_1.z.boolean().optional()),
    search: zod_1.z.string().optional(),
});
exports.notificationIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'Notification ID is required'),
});
//# sourceMappingURL=notification.validator.js.map