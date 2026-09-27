/**
 * Notification Validation Schemas — EEC EAMS (Phase 10B.1)
 */

import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const notificationTypes = [
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'MAINTENANCE',
  'TESTING',
  'ACCOUNT',
  'WARRANTY',
] as const;

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  message: z.string().min(1, 'Message is required'),
  type: z.nativeEnum(NotificationType),
  link: z.string().nullable().optional(),
});

export const createManyNotificationsSchema = z.array(createNotificationSchema);

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.string().optional(),
  isRead: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional()),
  search: z.string().optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
});

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;
export type NotificationQueryDTO = z.infer<typeof notificationQuerySchema>;
