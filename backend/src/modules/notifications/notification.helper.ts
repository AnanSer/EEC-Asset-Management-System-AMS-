/**
 * Notification Helper Functions — EEC EAMS (Phase 10B.2)
 * Safe dispatchers and recipient resolvers for Enterprise Notification Center.
 */

import prisma from '../../lib/prisma';
import { notificationService } from './notification.service';
import { NotificationType } from '@prisma/client';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}

/**
 * Safely send an in-app notification to a single user.
 * Catches and logs any errors to guarantee business transaction safety.
 */
export async function safeNotifyUser(payload: NotificationPayload): Promise<void> {
  try {
    if (!payload.userId) return;
    await notificationService.notifyUser(payload);
  } catch (err: any) {
    console.error(`[safeNotifyUser] Failed to send notification to user ${payload.userId}:`, err?.message || err);
  }
}

/**
 * Safely send in-app notifications to multiple users.
 * Automatically deduplicates recipient User IDs and prevents empty dispatches.
 */
export async function safeNotifyUsers(payloads: NotificationPayload[]): Promise<void> {
  try {
    const validPayloads = payloads.filter((p) => Boolean(p.userId));
    if (validPayloads.length === 0) return;

    // Deduplicate by userId + title to prevent duplicate notifications during a single action
    const seen = new Set<string>();
    const deduplicated = validPayloads.filter((p) => {
      const key = `${p.userId}:${p.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await notificationService.notifyUsers(deduplicated);
  } catch (err: any) {
    console.error('[safeNotifyUsers] Failed to send notifications:', err?.message || err);
  }
}

/**
 * Helper to retrieve all active Admin user IDs.
 */
export async function getAdminUserIds(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', status: 'APPROVED' },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  } catch (err) {
    console.error('[getAdminUserIds] Failed to fetch admin IDs:', err);
    return [];
  }
}

/**
 * Helper to retrieve the Department Manager user ID for a specific department.
 */
export async function getDepartmentManagerUserId(departmentId?: string | null): Promise<string | null> {
  if (!departmentId) return null;
  try {
    const manager = await prisma.user.findFirst({
      where: {
        role: 'DEPARTMENT_MANAGER',
        status: 'APPROVED',
        employeeProfile: { departmentId },
      },
      select: { id: true },
    });
    return manager?.id || null;
  } catch (err) {
    console.error(`[getDepartmentManagerUserId] Failed for department ${departmentId}:`, err);
    return null;
  }
}

/**
 * Helper to resolve an IT Technician's user ID from name, employeeId, email, or profileId.
 */
export async function getTechnicianUserId(identifier?: string | null): Promise<string | null> {
  if (!identifier) return null;
  try {
    const trimmed = identifier.trim();
    const nameParts = trimmed.split(' ');

    const tech = await prisma.user.findFirst({
      where: {
        role: 'IT_TECHNICIAN',
        OR: [
          { id: trimmed },
          { email: trimmed },
          { employeeProfile: { id: trimmed } },
          { employeeProfile: { employeeId: trimmed } },
          ...(nameParts.length >= 2
            ? [
                {
                  employeeProfile: {
                    firstName: { equals: nameParts[0], mode: 'insensitive' as const },
                    lastName: { equals: nameParts.slice(1).join(' '), mode: 'insensitive' as const },
                  },
                },
              ]
            : [
                {
                  employeeProfile: {
                    firstName: { equals: trimmed, mode: 'insensitive' as const },
                  },
                },
                {
                  employeeProfile: {
                    lastName: { equals: trimmed, mode: 'insensitive' as const },
                  },
                },
              ]),
        ],
      },
      select: { id: true },
    });

    return tech?.id || null;
  } catch (err) {
    console.error(`[getTechnicianUserId] Failed for identifier ${identifier}:`, err);
    return null;
  }
}

/**
 * Helper to retrieve the active owner User ID of an asset.
 */
export async function getAssetOwnerUserId(assetId?: string | null): Promise<string | null> {
  if (!assetId) return null;
  try {
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId, isCurrent: true },
      include: { employee: true },
    });
    return activeAssignment?.employee?.userId || null;
  } catch (err) {
    console.error(`[getAssetOwnerUserId] Failed for asset ${assetId}:`, err);
    return null;
  }
}
