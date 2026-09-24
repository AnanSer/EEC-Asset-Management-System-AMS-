import { Router } from 'express';
import { settingsController } from './settings.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/requirePermission';
import { PERMISSIONS } from '../../constants/permissions';

const router = Router();

// All settings routes require authentication
router.use(requireAuth());

// GET /api/settings — View current settings (All authenticated users)
router.get('/', settingsController.getSettings);

// PATCH /api/settings — Update settings (ADMIN only via SETTINGS_UPDATE permission)
router.patch(
  '/',
  requirePermission(PERMISSIONS.SETTINGS_UPDATE),
  settingsController.updateSettings
);

// GET /api/settings/system-info — System information (All authenticated users)
router.get('/system-info', settingsController.getSystemInfo);

export default router;
