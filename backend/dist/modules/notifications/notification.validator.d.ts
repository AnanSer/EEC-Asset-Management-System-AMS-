/**
 * Notification Validation Schemas — EEC EAMS (Phase 10B.1)
 */
import { z } from 'zod';
export declare const notificationTypes: readonly ['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'MAINTENANCE', 'TESTING', 'ACCOUNT', 'WARRANTY'];
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<{
        INFO: 'INFO';
        SUCCESS: 'SUCCESS';
        WARNING: 'WARNING';
        ERROR: 'ERROR';
        MAINTENANCE: 'MAINTENANCE';
        TESTING: 'TESTING';
        ACCOUNT: 'ACCOUNT';
        WARRANTY: 'WARRANTY';
    }>;
    link: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createManyNotificationsSchema: z.ZodArray<z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<{
        INFO: 'INFO';
        SUCCESS: 'SUCCESS';
        WARNING: 'WARNING';
        ERROR: 'ERROR';
        MAINTENANCE: 'MAINTENANCE';
        TESTING: 'TESTING';
        ACCOUNT: 'ACCOUNT';
        WARRANTY: 'WARRANTY';
    }>;
    link: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>>;
export declare const notificationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    type: z.ZodOptional<z.ZodString>;
    isRead: z.ZodPreprocess<z.ZodOptional<z.ZodBoolean>, unknown>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const notificationIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;
export type NotificationQueryDTO = z.infer<typeof notificationQuerySchema>;
//# sourceMappingURL=notification.validator.d.ts.map