import prisma, { pool } from '../../lib/prisma';
import { UpdateSettingsDTO } from './settings.validator';

export interface SystemSettingsRecord {
  id: string;
  organizationName: string;
  organizationShortName: string;
  supportEmail: string;
  supportPhone: string;
  headquartersAddress: string;
  logoUrl: string | null;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_SETTINGS: Omit<SystemSettingsRecord, 'id' | 'createdAt' | 'updatedAt'> = {
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

export class SettingsRepository {
  /**
   * Retrieves the system settings singleton, or initializes default settings if empty.
   */
  async getSettings(): Promise<SystemSettingsRecord> {
    if ((prisma as any).systemSettings) {
      let settings = await (prisma as any).systemSettings.findFirst();
      if (!settings) {
        settings = await (prisma as any).systemSettings.create({
          data: DEFAULT_SETTINGS,
        });
      }
      return settings;
    }

    // Direct PostgreSQL query fallback
    const res = await pool.query<SystemSettingsRecord>(
      'SELECT * FROM "SystemSettings" ORDER BY "createdAt" ASC LIMIT 1'
    );

    if (res.rows.length > 0) {
      return res.rows[0];
    }

    const insertRes = await pool.query<SystemSettingsRecord>(
      `INSERT INTO "SystemSettings" (
        "id", "organizationName", "organizationShortName", "supportEmail",
        "supportPhone", "headquartersAddress", "logoUrl", "defaultLanguage",
        "timezone", "dateFormat", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *`,
      [
        DEFAULT_SETTINGS.organizationName,
        DEFAULT_SETTINGS.organizationShortName,
        DEFAULT_SETTINGS.supportEmail,
        DEFAULT_SETTINGS.supportPhone,
        DEFAULT_SETTINGS.headquartersAddress,
        DEFAULT_SETTINGS.logoUrl,
        DEFAULT_SETTINGS.defaultLanguage,
        DEFAULT_SETTINGS.timezone,
        DEFAULT_SETTINGS.dateFormat,
      ]
    );

    return insertRes.rows[0];
  }

  /**
   * Updates the system settings singleton.
   */
  async updateSettings(data: UpdateSettingsDTO): Promise<SystemSettingsRecord> {
    const current = await this.getSettings();

    if ((prisma as any).systemSettings) {
      return await (prisma as any).systemSettings.update({
        where: { id: current.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    }

    const fields: string[] = [];
    const values: any[] = [];
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

    const res = await pool.query<SystemSettingsRecord>(updateQuery, values);
    return res.rows[0];
  }
}

export const settingsRepository = new SettingsRepository();
