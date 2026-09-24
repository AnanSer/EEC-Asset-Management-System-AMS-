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
export declare const DEFAULT_SETTINGS: Omit<SystemSettingsRecord, 'id' | 'createdAt' | 'updatedAt'>;
export declare class SettingsRepository {
    /**
     * Retrieves the system settings singleton, or initializes default settings if empty.
     */
    getSettings(): Promise<SystemSettingsRecord>;
    /**
     * Updates the system settings singleton.
     */
    updateSettings(data: UpdateSettingsDTO): Promise<SystemSettingsRecord>;
}
export declare const settingsRepository: SettingsRepository;
//# sourceMappingURL=settings.repository.d.ts.map