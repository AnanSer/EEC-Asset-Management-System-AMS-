import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
export declare class SettingsController {
    private service;
    constructor(service?: SettingsService);
    /**
     * GET /api/settings
     * Retrieve current system settings.
     * Accessible by all authenticated users.
     */
    getSettings: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/settings
     * Update system settings.
     * Restricted to ADMIN role (requirePermission SETTINGS_UPDATE).
     */
    updateSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/settings/system-info
     * Retrieve read-only runtime and deployment system information.
     * Accessible by all authenticated users.
     */
    getSystemInfo: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
export declare const settingsController: SettingsController;
//# sourceMappingURL=settings.controller.d.ts.map