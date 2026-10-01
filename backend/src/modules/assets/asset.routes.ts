import { Router } from 'express';
import { assetController } from './asset.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All asset routes require an authenticated session
router.use(requireAuth());

// GET /api/assets - list assets (scoped by role in controller)
router.get('/', assetController.getAll);

// GET /api/assets/inventory - Store Keeper / Tech / Manager / Admin inventory counts (must be before /:id)
router.get(
  '/inventory',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER, ROLES.STORE_KEEPER),
  assetController.getInventory
);

// GET /api/assets/:id - get single asset details (scoped by canAccessAsset in controller)
router.get('/:id', assetController.getById);

// POST /api/assets - register a new asset (ADMIN and IT_TECHNICIAN)
router.post(
  '/',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assetController.create
);

// PUT /api/assets/:id - update asset details (ADMIN and IT_TECHNICIAN)
router.put(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assetController.update
);

// PATCH /api/assets/:id/status - change asset status (ADMIN and IT_TECHNICIAN)
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assetController.updateStatus
);

// PATCH /api/assets/:id/location - physical location update (ADMIN, IT_TECHNICIAN, STORE_KEEPER)
router.patch(
  '/:id/location',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.STORE_KEEPER),
  assetController.updateLocation
);

export default router;
