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
        // In-app Notification: Settings Updated (Phase 10B.2)
        let targetAdminId = adminUserId;
        if (!targetAdminId) {
            const adminIds = await (0, notifications_1.getAdminUserIds)();
            targetAdminId = adminIds[0];
        }
        if (targetAdminId) {
            await (0, notifications_1.safeNotifyUser)({
                userId: targetAdminId,
                type: client_1.NotificationType.SUCCESS,
                title: 'Settings Updated',
                message: 'Organization settings updated successfully.',
                link: '/settings',
            });
        }
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