import { settingsRepository, SettingsRepository, SystemSettingsRecord } from './settings.repository';
import { UpdateSettingsDTO } from './settings.validator';
import { NotificationType } from '@prisma/client';
import { safeNotifyUser, getAdminUserIds } from '../notifications';

export interface SystemInfoDTO {
  systemVersion: string;
  backendStatus: string;
  database: string;
  authProvider: string;
  mailProvider: string;
  nodeVersion: string;
  environment: string;
  uptimeSeconds: number;
  serverTime: string;
}

export class SettingsService {
  constructor(private repo: SettingsRepository = settingsRepository) {}

  async getSettings(): Promise<SystemSettingsRecord> {
    return this.repo.getSettings();
  }

  async updateSettings(data: UpdateSettingsDTO, adminUserId?: string): Promise<SystemSettingsRecord> {
    const updated = await this.repo.updateSettings(data);

    // In-app Notification: Settings Updated (Phase 10B.2)
    let targetAdminId = adminUserId;
    if (!targetAdminId) {
      const adminIds = await getAdminUserIds();
      targetAdminId = adminIds[0];
    }

    if (targetAdminId) {
      await safeNotifyUser({
        userId: targetAdminId,
        type: NotificationType.SUCCESS,
        title: 'Settings Updated',
        message: 'Organization settings updated successfully.',
        link: '/settings',
      });
    }

    return updated;
  }

  async getSystemInfo(): Promise<SystemInfoDTO> {
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

export const settingsService = new SettingsService();
