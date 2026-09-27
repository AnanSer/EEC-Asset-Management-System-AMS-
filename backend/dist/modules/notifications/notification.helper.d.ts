/**
 * Notification Helper Functions — EEC EAMS (Phase 10B.2)
 * Safe dispatchers and recipient resolvers for Enterprise Notification Center.
 */
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
export declare function safeNotifyUser(payload: NotificationPayload): Promise<void>;
/**
 * Safely send in-app notifications to multiple users.
 * Automatically deduplicates recipient User IDs and prevents empty dispatches.
 */
export declare function safeNotifyUsers(payloads: NotificationPayload[]): Promise<void>;
/**
 * Helper to retrieve all active Admin user IDs.
 */
export declare function getAdminUserIds(): Promise<string[]>;
/**
 * Helper to retrieve the Department Manager user ID for a specific department.
 */
export declare function getDepartmentManagerUserId(departmentId?: string | null): Promise<string | null>;
/**
 * Helper to resolve an IT Technician's user ID from name, employeeId, email, or profileId.
 */
export declare function getTechnicianUserId(identifier?: string | null): Promise<string | null>;
/**
 * Helper to retrieve the active owner User ID of an asset.
 */
export declare function getAssetOwnerUserId(assetId?: string | null): Promise<string | null>;
//# sourceMappingURL=notification.helper.d.ts.map