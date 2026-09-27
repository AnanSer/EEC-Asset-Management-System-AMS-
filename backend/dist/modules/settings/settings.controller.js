"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = exports.SettingsController = void 0;
const settings_service_1 = require("./settings.service");
const settings_validator_1 = require("./settings.validator");
const api_1 = require("../../lib/api");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class SettingsController {
    constructor(service = settings_service_1.settingsService) {
        this.service = service;
        /**
         * GET /api/settings
         * Retrieve current system settings.
         * Accessible by all authenticated users.
         */
        this.getSettings = async (_req, res) => {
            try {
                const settings = await this.service.getSettings();
                return res.status(200).json((0, api_1.successResponse)(settings));
            }
            catch (err) {
                console.error('Error fetching settings:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve system settings', 'INTERNAL_ERROR', err?.message));
            }
        };
        /**
         * PATCH /api/settings
         * Update system settings.
         * Restricted to ADMIN role (requirePermission SETTINGS_UPDATE).
         */
        this.updateSettings = async (req, res) => {
            try {
                const validatedData = settings_validator_1.updateSettingsSchema.parse(req.body);
                let adminUserId = undefined;
                if (req.auth?.user) {
                    const adminUser = await prisma_1.default.user.findFirst({
                        where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                    });
                    adminUserId = adminUser?.id || req.auth.user.id;
                }
                const updated = await this.service.updateSettings(validatedData, adminUserId);
                return res.status(200).json((0, api_1.successResponse)(updated, undefined, 'System settings updated successfully'));
            }
            catch (err) {
                if (err?.name === 'ZodError') {
                    const formattedErrors = err.issues?.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    }));
                    return res.status(422).json((0, api_1.errorResponse)('Validation failed', 'VALIDATION_ERROR', formattedErrors));
                }
                console.error('Error updating settings:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to update system settings', 'INTERNAL_ERROR', err?.message));
            }
        };
        /**
         * GET /api/settings/system-info
         * Retrieve read-only runtime and deployment system information.
         * Accessible by all authenticated users.
         */
        this.getSystemInfo = async (_req, res) => {
            try {
                const systemInfo = await this.service.getSystemInfo();
                return res.status(200).json((0, api_1.successResponse)(systemInfo));
            }
            catch (err) {
                console.error('Error fetching system info:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve system information', 'INTERNAL_ERROR', err?.message));
            }
        };
    }
}
exports.SettingsController = SettingsController;
exports.settingsController = new SettingsController();
//# sourceMappingURL=settings.controller.js.map