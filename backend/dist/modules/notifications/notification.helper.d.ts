/**
 * Notification Helper Functions — EEC EAMS (Phase 10B.2 & 10B.4 Audit)
 * Safe dispatchers, recipient resolvers, and diagnostic logging for Enterprise Notification Center.
 */
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
export declare function logNotificationDispatch(params: DiagnosticLogParams): void;
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
 * Helper to retrieve all active, approved Admin user IDs.
 */
export declare function getAdminUserIds(): Promise<string[]>;
/**
 * Helper to retrieve the active Department Manager user ID for a specific department.
 */
export declare function getDepartmentManagerUserId(departmentId?: string | null): Promise<string | null>;
/**
 * Helper to resolve an active IT Technician's user ID from name, employeeId, email, or profileId.
 * Strips formatting annotations (such as department name or parentheses) and verifies role and active status.
 */
export declare function getTechnicianUserId(identifier?: string | null): Promise<string | null>;
/**
 * Helper to retrieve eligible active IT Technicians for a maintenance request.
 * If departmentId is provided and technicians belong to that department, prioritizes department technicians.
 * Otherwise returns all active approved IT technicians.
 */
export declare function getEligibleTechnicianUserIds(departmentId?: string | null): Promise<string[]>;
/**
 * Helper to retrieve the active owner User ID of an asset.
 * If no current assignment exists, optionally falls back to looking up the reporter.
 */
export declare function getAssetOwnerUserId(assetId?: string | null, fallbackReporter?: string | null): Promise<string | null>;
//# sourceMappingURL=notification.helper.d.ts.map