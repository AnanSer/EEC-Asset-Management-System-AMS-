"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const zod_1 = require("zod");
exports.updateSettingsSchema = zod_1.z.object({
    organizationName: zod_1.z
        .string()
        .trim()
        .min(2, 'Organization name must be at least 2 characters')
        .max(100, 'Organization name cannot exceed 100 characters')
        .optional(),
    organizationShortName: zod_1.z
        .string()
        .trim()
        .min(1, 'Short name must be at least 1 character')
        .max(20, 'Short name cannot exceed 20 characters')
        .optional(),
    supportEmail: zod_1.z
        .string()
        .trim()
        .email('Please enter a valid support email address')
        .optional(),
    supportPhone: zod_1.z
        .string()
        .trim()
        .min(5, 'Support phone must be at least 5 characters')
        .max(30, 'Support phone cannot exceed 30 characters')
        .optional(),
    headquartersAddress: zod_1.z
        .string()
        .trim()
        .min(2, 'Headquarters address must be at least 2 characters')
        .max(200, 'Headquarters address cannot exceed 200 characters')
        .optional(),
    logoUrl: zod_1.z
        .string()
        .trim()
        .url('Please enter a valid URL for the organization logo')
        .nullable()
        .optional(),
    defaultLanguage: zod_1.z
        .enum(['EN', 'AM', 'OM'])
        .optional(),
    timezone: zod_1.z
        .string()
        .trim()
        .min(2, 'Timezone is required')
        .max(50, 'Timezone is too long')
        .optional(),
    dateFormat: zod_1.z
        .string()
        .trim()
        .min(2, 'Date format is required')
        .max(30, 'Date format is too long')
        .optional(),
});
//# sourceMappingURL=settings.validator.js.map