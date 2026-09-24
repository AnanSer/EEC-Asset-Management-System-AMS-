import { Request, Response } from 'express';
import { settingsService, SettingsService } from './settings.service';
import { updateSettingsSchema } from './settings.validator';
import { successResponse, errorResponse } from '../../lib/api';

export class SettingsController {
  constructor(private service: SettingsService = settingsService) {}

  /**
   * GET /api/settings
   * Retrieve current system settings.
   * Accessible by all authenticated users.
   */
  getSettings = async (_req: Request, res: Response) => {
    try {
      const settings = await this.service.getSettings();
      return res.status(200).json(successResponse(settings));
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve system settings', 'INTERNAL_ERROR', err?.message)
      );
    }
  };

  /**
   * PATCH /api/settings
   * Update system settings.
   * Restricted to ADMIN role (requirePermission SETTINGS_UPDATE).
   */
  updateSettings = async (req: Request, res: Response) => {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);
      const updated = await this.service.updateSettings(validatedData);

      return res.status(200).json(
        successResponse(updated, undefined, 'System settings updated successfully')
      );
    } catch (err: any) {
      if (err?.name === 'ZodError') {
        const formattedErrors = err.issues?.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return res.status(422).json(
          errorResponse('Validation failed', 'VALIDATION_ERROR', formattedErrors)
        );
      }

      console.error('Error updating settings:', err);
      return res.status(500).json(
        errorResponse('Failed to update system settings', 'INTERNAL_ERROR', err?.message)
      );
    }
  };

  /**
   * GET /api/settings/system-info
   * Retrieve read-only runtime and deployment system information.
   * Accessible by all authenticated users.
   */
  getSystemInfo = async (_req: Request, res: Response) => {
    try {
      const systemInfo = await this.service.getSystemInfo();
      return res.status(200).json(successResponse(systemInfo));
    } catch (err: any) {
      console.error('Error fetching system info:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve system information', 'INTERNAL_ERROR', err?.message)
      );
    }
  };
}

export const settingsController = new SettingsController();

