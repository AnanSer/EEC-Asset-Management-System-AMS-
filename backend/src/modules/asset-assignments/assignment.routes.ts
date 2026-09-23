import { Router } from 'express';
import { assignmentController } from './assignment.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All assignment routes require an authenticated session
router.use(requireAuth());

// Stats endpoint (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
router.get(
  '/stats',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER),
  assignmentController.getStats
);

// History for an asset (scoped by canAccessAsset in controller)
router.get('/history/:assetId', assignmentController.getHistory);

// Assignment lifecycle actions (ADMIN and IT_TECHNICIAN only)
router.post(
  '/assign',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assignmentController.assign
);
router.patch(
  '/transfer/:assetId',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assignmentController.transfer
);
router.patch(
  '/return/:assetId',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  assignmentController.returnAsset
);

// List and single assignment (scoped by role in controller)
router.get('/', assignmentController.getAll);
router.get('/:id', assignmentController.getById);

export default router;
