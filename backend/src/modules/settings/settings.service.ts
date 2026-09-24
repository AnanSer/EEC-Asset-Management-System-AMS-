import { settingsRepository, SettingsRepository, SystemSettingsRecord } from './settings.repository';
import { UpdateSettingsDTO } from './settings.validator';

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

  async updateSettings(data: UpdateSettingsDTO): Promise<SystemSettingsRecord> {
    return this.repo.updateSettings(data);
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
