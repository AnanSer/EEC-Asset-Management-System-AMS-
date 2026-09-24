"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = exports.SettingsRepository = exports.DEFAULT_SETTINGS = void 0;
const prisma_1 = __importStar(require("../../lib/prisma"));
exports.DEFAULT_SETTINGS = {
    organizationName: 'Ethiopian Engineering Corporation',
    organizationShortName: 'EEC',
    supportEmail: 'support@eec.gov.et',
    supportPhone: '+251 11 123 4567',
    headquartersAddress: 'Addis Ababa Head Office (Kazanchis), Ethiopia',
    logoUrl: '/branding/eec-logo.png',
    defaultLanguage: 'EN',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
};
class SettingsRepository {
    /**
     * Retrieves the system settings singleton, or initializes default settings if empty.
     */
    async getSettings() {
        if (prisma_1.default.systemSettings) {
            let settings = await prisma_1.default.systemSettings.findFirst();
            if (!settings) {
                settings = await prisma_1.default.systemSettings.create({
                    data: exports.DEFAULT_SETTINGS,
                });
            }
            return settings;
        }
        // Direct PostgreSQL query fallback
        const res = await prisma_1.pool.query('SELECT * FROM "SystemSettings" ORDER BY "createdAt" ASC LIMIT 1');
        if (res.rows.length > 0) {
            return res.rows[0];
        }
        const insertRes = await prisma_1.pool.query(`INSERT INTO "SystemSettings" (
        "id", "organizationName", "organizationShortName", "supportEmail",
        "supportPhone", "headquartersAddress", "logoUrl", "defaultLanguage",
        "timezone", "dateFormat", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *`, [
            exports.DEFAULT_SETTINGS.organizationName,
            exports.DEFAULT_SETTINGS.organizationShortName,
            exports.DEFAULT_SETTINGS.supportEmail,
            exports.DEFAULT_SETTINGS.supportPhone,
            exports.DEFAULT_SETTINGS.headquartersAddress,
            exports.DEFAULT_SETTINGS.logoUrl,
            exports.DEFAULT_SETTINGS.defaultLanguage,
            exports.DEFAULT_SETTINGS.timezone,
            exports.DEFAULT_SETTINGS.dateFormat,
        ]);
        return insertRes.rows[0];
    }
    /**
     * Updates the system settings singleton.
     */
    async updateSettings(data) {
        const current = await this.getSettings();
        if (prisma_1.default.systemSettings) {
            return await prisma_1.default.systemSettings.update({
                where: { id: current.id },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
            });
        }
        const fields = [];
        const values = [];
        let idx = 1;
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fields.push(`"${key}" = $${idx}`);
                values.push(value);
                idx++;
            }
        }
        if (fields.length === 0) {
            return current;
        }
        fields.push(`"updatedAt" = NOW()`);
        values.push(current.id);
        const updateQuery = `
      UPDATE "SystemSettings"
      SET ${fields.join(', ')}
      WHERE "id" = $${idx}
      RETURNING *
    `;
        const res = await prisma_1.pool.query(updateQuery, values);
        return res.rows[0];
    }
}
exports.SettingsRepository = SettingsRepository;
exports.settingsRepository = new SettingsRepository();
//# sourceMappingURL=settings.repository.js.map