/**
 * Notification Helper Functions — EEC EAMS (Phase 10B.2 & 10B.4 Audit)
 * Safe dispatchers, recipient resolvers, and diagnostic logging for Enterprise Notification Center.
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

export interface DiagnosticLogParams {
  event: string;
  ticket?: string;
  requester?: string;
  assetOwner?: string;
  department?: string;
  resolvedTechnicians?: string[];
  resolvedManagers?: string[];
  resolvedAdmins?: string[];
  notifiedUsers: string[];
}

/**
 * Diagnostic logger for notification dispatch in development.
 * Never logs credentials, passwords, or sensitive authentication secrets.
 */
export function logNotificationDispatch(params: DiagnosticLogParams): void {
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_NOTIFICATION_LOGS === 'true') {
    console.log(`\n[NOTIFICATION_DISPATCH] ═════════════════════════════════════`);
    console.log(`EVENT: ${params.event}`);
    if (params.ticket) console.log(`TICKET: ${params.ticket}`);
    if (params.requester) console.log(`REQUESTER: ${params.requester}`);
    if (params.assetOwner) console.log(`ASSET_OWNER: ${params.assetOwner}`);
    if (params.department) console.log(`DEPARTMENT: ${params.department}`);
    if (params.resolvedTechnicians && params.resolvedTechnicians.length > 0) {
      console.log(`RESOLVED TECHNICIANS: [${params.resolvedTechnicians.join(', ')}]`);
    }
    if (params.resolvedManagers && params.resolvedManagers.length > 0) {
      console.log(`RESOLVED MANAGERS: [${params.resolvedManagers.join(', ')}]`);
    }
    if (params.resolvedAdmins && params.resolvedAdmins.length > 0) {
      console.log(`RESOLVED ADMINS: [${params.resolvedAdmins.join(', ')}]`);
    }
    console.log(`NOTIFIED USERS: [${params.notifiedUsers.join(', ')}]`);
    console.log(`═════════════════════════════════════════════════════════════\n`);
  }
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
 * Helper to retrieve all active, approved Admin user IDs.
 */
export async function getAdminUserIds(): Promise<string[]> {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'APPROVED',
      },
      select: { id: true },
    });
    return admins.map((a) => a.id);
  } catch (err) {
    console.error('[getAdminUserIds] Failed to fetch admin IDs:', err);
    return [];
  }
}

/**
 * Helper to retrieve the active Department Manager user ID for a specific department.
 */
export async function getDepartmentManagerUserId(departmentId?: string | null): Promise<string | null> {
  if (!departmentId) return null;
  try {
    const manager = await prisma.user.findFirst({
      where: {
        role: 'DEPARTMENT_MANAGER',
        status: 'APPROVED',
        employeeProfile: {
          departmentId,
          isActive: true,
        },
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
 * Helper to resolve an active IT Technician's user ID from name, employeeId, email, or profileId.
 * Strips formatting annotations (such as department name or parentheses) and verifies role and active status.
 */
export async function getTechnicianUserId(identifier?: string | null): Promise<string | null> {
  if (!identifier) return null;
  try {
    const raw = identifier.trim();
    // Remove parenthesized content (e.g., "Biruk Tadesse (EMP-003 - ICT Directorate)" -> "Biruk Tadesse")
    const cleaned = raw.replace(/\(.*?\)/g, '').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);

    // 1. Direct match on user.id, email, employeeProfile.id, or employeeProfile.employeeId
    const directMatch = await prisma.user.findFirst({
      where: {
        role: 'IT_TECHNICIAN',
        status: 'APPROVED',
        employeeProfile: { isActive: true },
        OR: [
          { id: raw },
          { email: raw },
          { employeeProfile: { id: raw } },
          { employeeProfile: { employeeId: raw } },
          { employeeProfile: { employeeId: cleaned } },
        ],
      },
      select: { id: true },
    });

    if (directMatch) {
      return directMatch.id;
    }

    // 2. Name-based match (case-insensitive)
    if (parts.length >= 2) {
      const firstNamePart = parts[0];
      const lastNamePart = parts.slice(1).join(' ');

      const nameMatch = await prisma.user.findFirst({
        where: {
          role: 'IT_TECHNICIAN',
          status: 'APPROVED',
          employeeProfile: {
            isActive: true,
            firstName: { equals: firstNamePart, mode: 'insensitive' },
            lastName: { equals: lastNamePart, mode: 'insensitive' },
          },
        },
        select: { id: true },
      });

      if (nameMatch) {
        return nameMatch.id;
      }
    } else if (parts.length === 1) {
      const singleMatch = await prisma.user.findFirst({
        where: {
          role: 'IT_TECHNICIAN',
          status: 'APPROVED',
          employeeProfile: {
            isActive: true,
            OR: [
              { firstName: { equals: parts[0], mode: 'insensitive' } },
              { lastName: { equals: parts[0], mode: 'insensitive' } },
            ],
          },
        },
        select: { id: true },
      });

      if (singleMatch) {
        return singleMatch.id;
      }
    }

    return null;
  } catch (err) {
    console.error(`[getTechnicianUserId] Failed for identifier ${identifier}:`, err);
    return null;
  }
}

/**
 * Helper to retrieve eligible active IT Technicians for a maintenance request.
 * If departmentId is provided and technicians belong to that department, prioritizes department technicians.
 * Otherwise returns all active approved IT technicians.
 */
export async function getEligibleTechnicianUserIds(departmentId?: string | null): Promise<string[]> {
  try {
    if (departmentId) {
      const deptTechnicians = await prisma.user.findMany({
        where: {
          role: 'IT_TECHNICIAN',
          status: 'APPROVED',
          employeeProfile: {
            departmentId,
            isActive: true,
          },
        },
        select: { id: true },
      });

      if (deptTechnicians.length > 0) {
        return deptTechnicians.map((t) => t.id);
      }
    }

    // Fallback: All active approved IT technicians
    const allTechnicians = await prisma.user.findMany({
      where: {
        role: 'IT_TECHNICIAN',
        status: 'APPROVED',
        employeeProfile: {
          isActive: true,
        },
      },
      select: { id: true },
    });

    return allTechnicians.map((t) => t.id);
  } catch (err) {
    console.error('[getEligibleTechnicianUserIds] Failed to fetch eligible technician IDs:', err);
    return [];
  }
}

/**
 * Helper to retrieve the active owner User ID of an asset.
 * If no current assignment exists, optionally falls back to looking up the reporter.
 */
export async function getAssetOwnerUserId(
  assetId?: string | null,
  fallbackReporter?: string | null
): Promise<string | null> {
  if (!assetId && !fallbackReporter) return null;
  try {
    if (assetId) {
      const activeAssignment = await prisma.assetAssignment.findFirst({
        where: { assetId, isCurrent: true },
        include: { employee: true },
      });
      if (activeAssignment?.employee?.userId) {
        return activeAssignment.employee.userId;
      }
    }

    if (fallbackReporter) {
      const trimmed = fallbackReporter.trim();
      const reporterUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: trimmed },
            { email: trimmed },
            { employeeProfile: { id: trimmed } },
            { employeeProfile: { employeeId: trimmed } },
          ],
        },
        select: { id: true },
      });
      if (reporterUser?.id) {
        return reporterUser.id;
      }
    }

    return null;
  } catch (err) {
    console.error(`[getAssetOwnerUserId] Failed for asset ${assetId}:`, err);
    return null;
  }
}

