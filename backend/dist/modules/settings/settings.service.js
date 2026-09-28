"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = exports.SettingsService = void 0;
const settings_repository_1 = require("./settings.repository");
const client_1 = require("@prisma/client");
const notifications_1 = require("../notifications");
class SettingsService {
    constructor(repo = settings_repository_1.settingsRepository) {
        this.repo = repo;
    }
    async getSettings() {
        return this.repo.getSettings();
    }
    async updateSettings(data, adminUserId) {
        const updated = await this.repo.updateSettings(data);
        // In-app Notification: Settings Updated (Phase 10B.2 & 10B.4 Audit) -> Notify all active Admin users
        const adminUserIds = await (0, notifications_1.getAdminUserIds)();
        const adminNotifications = adminUserIds.map((adminId) => ({
            userId: adminId,
            type: client_1.NotificationType.SUCCESS,
            title: 'Settings Updated',
            message: 'Organization settings updated successfully.',
            link: '/settings',
        }));
        await (0, notifications_1.safeNotifyUsers)(adminNotifications);
        (0, notifications_1.logNotificationDispatch)({
            event: 'SYSTEM_SETTINGS_UPDATED',
            requester: adminUserId || undefined,
            resolvedAdmins: adminUserIds,
            notifiedUsers: adminUserIds,
        });
        return updated;
    }
    async getSystemInfo() {
        return {
            systemVersion: 'v1.0.0',
            backendStatus: 'Connected',
            database: 'PostgreSQL',
            authProvider: 'Better Auth',
            mailProvider: 'Nodemailer Gmail SMTP',
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            uptimeSeconds: Math.floor(process.uptime()),
            serverTime: new Date().toISOString(),
        };
    }
}
exports.SettingsService = SettingsService;
exports.settingsService = new SettingsService();
//# sourceMappingURL=settings.service.js.map