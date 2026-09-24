"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = exports.SettingsService = void 0;
const settings_repository_1 = require("./settings.repository");
class SettingsService {
    constructor(repo = settings_repository_1.settingsRepository) {
        this.repo = repo;
    }
    async getSettings() {
        return this.repo.getSettings();
    }
    async updateSettings(data) {
        return this.repo.updateSettings(data);
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