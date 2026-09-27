"use strict";
/**
 * Notification Helper Functions — EEC EAMS (Phase 10B.2)
 * Safe dispatchers and recipient resolvers for Enterprise Notification Center.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeNotifyUser = safeNotifyUser;
exports.safeNotifyUsers = safeNotifyUsers;
exports.getAdminUserIds = getAdminUserIds;
exports.getDepartmentManagerUserId = getDepartmentManagerUserId;
exports.getTechnicianUserId = getTechnicianUserId;
exports.getAssetOwnerUserId = getAssetOwnerUserId;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const notification_service_1 = require("./notification.service");
/**
 * Safely send an in-app notification to a single user.
 * Catches and logs any errors to guarantee business transaction safety.
 */
async function safeNotifyUser(payload) {
    try {
        if (!payload.userId)
            return;
        await notification_service_1.notificationService.notifyUser(payload);
    }
    catch (err) {
        console.error(`[safeNotifyUser] Failed to send notification to user ${payload.userId}:`, err?.message || err);
    }
}
/**
 * Safely send in-app notifications to multiple users.
 * Automatically deduplicates recipient User IDs and prevents empty dispatches.
 */
async function safeNotifyUsers(payloads) {
    try {
        const validPayloads = payloads.filter((p) => Boolean(p.userId));
        if (validPayloads.length === 0)
            return;
        // Deduplicate by userId + title to prevent duplicate notifications during a single action
        const seen = new Set();
        const deduplicated = validPayloads.filter((p) => {
            const key = `${p.userId}:${p.title}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        await notification_service_1.notificationService.notifyUsers(deduplicated);
    }
    catch (err) {
        console.error('[safeNotifyUsers] Failed to send notifications:', err?.message || err);
    }
}
/**
 * Helper to retrieve all active Admin user IDs.
 */
async function getAdminUserIds() {
    try {
        const admins = await prisma_1.default.user.findMany({
            where: { role: 'ADMIN', status: 'APPROVED' },
            select: { id: true },
        });
        return admins.map((a) => a.id);
    }
    catch (err) {
        console.error('[getAdminUserIds] Failed to fetch admin IDs:', err);
        return [];
    }
}
/**
 * Helper to retrieve the Department Manager user ID for a specific department.
 */
async function getDepartmentManagerUserId(departmentId) {
    if (!departmentId)
        return null;
    try {
        const manager = await prisma_1.default.user.findFirst({
            where: {
                role: 'DEPARTMENT_MANAGER',
                status: 'APPROVED',
                employeeProfile: { departmentId },
            },
            select: { id: true },
        });
        return manager?.id || null;
    }
    catch (err) {
        console.error(`[getDepartmentManagerUserId] Failed for department ${departmentId}:`, err);
        return null;
    }
}
/**
 * Helper to resolve an IT Technician's user ID from name, employeeId, email, or profileId.
 */
async function getTechnicianUserId(identifier) {
    if (!identifier)
        return null;
    try {
        const trimmed = identifier.trim();
        const nameParts = trimmed.split(' ');
        const tech = await prisma_1.default.user.findFirst({
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
                                    firstName: { equals: nameParts[0], mode: 'insensitive' },
                                    lastName: { equals: nameParts.slice(1).join(' '), mode: 'insensitive' },
                                },
                            },
                        ]
                        : [
                            {
                                employeeProfile: {
                                    firstName: { equals: trimmed, mode: 'insensitive' },
                                },
                            },
                            {
                                employeeProfile: {
                                    lastName: { equals: trimmed, mode: 'insensitive' },
                                },
                            },
                        ]),
                ],
            },
            select: { id: true },
        });
        return tech?.id || null;
    }
    catch (err) {
        console.error(`[getTechnicianUserId] Failed for identifier ${identifier}:`, err);
        return null;
    }
}
/**
 * Helper to retrieve the active owner User ID of an asset.
 */
async function getAssetOwnerUserId(assetId) {
    if (!assetId)
        return null;
    try {
        const activeAssignment = await prisma_1.default.assetAssignment.findFirst({
            where: { assetId, isCurrent: true },
            include: { employee: true },
        });
        return activeAssignment?.employee?.userId || null;
    }
    catch (err) {
        console.error(`[getAssetOwnerUserId] Failed for asset ${assetId}:`, err);
        return null;
    }
}
//# sourceMappingURL=notification.helper.js.map