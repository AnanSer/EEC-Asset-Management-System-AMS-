import { SettingsRepository, SystemSettingsRecord } from './settings.repository';
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
export declare class SettingsService {
    private repo;
    constructor(repo?: SettingsRepository);
    getSettings(): Promise<SystemSettingsRecord>;
    updateSettings(data: UpdateSettingsDTO): Promise<SystemSettingsRecord>;
    getSystemInfo(): Promise<SystemInfoDTO>;
}
export declare const settingsService: SettingsService;
//# sourceMappingURL=settings.service.d.ts.map