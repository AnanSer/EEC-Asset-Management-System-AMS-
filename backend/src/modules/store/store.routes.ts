import { Router } from 'express';
import { storeController } from './store.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All store routes require session authentication
router.use(requireAuth());

// GET /api/store/dashboard - Store Keeper Operations Dashboard (STORE_KEEPER & ADMIN)
router.get(
  '/dashboard',
  requireRole(ROLES.STORE_KEEPER, ROLES.ADMIN),
  storeController.getDashboard
);

// GET /api/store/assets/:assetId/movement-history - Asset chronological movement history
router.get(
  '/assets/:assetId/movement-history',
  storeController.getAssetMovementHistory
);

export default router;
