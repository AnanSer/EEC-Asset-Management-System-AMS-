import { z } from 'zod';

export const updateSettingsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters')
    .optional(),
  organizationShortName: z
    .string()
    .trim()
    .min(1, 'Short name must be at least 1 character')
    .max(20, 'Short name cannot exceed 20 characters')
    .optional(),
  supportEmail: z
    .string()
    .trim()
    .email('Please enter a valid support email address')
    .optional(),
  supportPhone: z
    .string()
    .trim()
    .min(5, 'Support phone must be at least 5 characters')
    .max(30, 'Support phone cannot exceed 30 characters')
    .optional(),
  headquartersAddress: z
    .string()
    .trim()
    .min(2, 'Headquarters address must be at least 2 characters')
    .max(200, 'Headquarters address cannot exceed 200 characters')
    .optional(),
  logoUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL for the organization logo')
    .nullable()
    .optional(),
  defaultLanguage: z
    .enum(['EN', 'AM', 'OM'])
    .optional(),
  timezone: z
    .string()
    .trim()
    .min(2, 'Timezone is required')
    .max(50, 'Timezone is too long')
    .optional(),
  dateFormat: z
    .string()
    .trim()
    .min(2, 'Date format is required')
    .max(30, 'Date format is too long')
    .optional(),
});

export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;
