import { Router } from 'express';
import { departmentController } from './department.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All department routes require an authenticated session
router.use(requireAuth());

// GET /api/departments — List with search, status filter, and pagination
// Allowed: ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER
router.get(
  '/',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER),
  departmentController.getAll
);

// GET /api/departments/:id — Single department details
// Allowed: ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER
router.get(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER),
  departmentController.getById
);

// POST /api/departments — Create department
// Allowed: ADMIN only
router.post(
  '/',
  requireRole(ROLES.ADMIN),
  departmentController.create
);

// PUT /api/departments/:id — Update department
// Allowed: ADMIN only
router.put(
  '/:id',
  requireRole(ROLES.ADMIN),
  departmentController.update
);

// PATCH /api/departments/:id/status — Soft activate/deactivate
// Allowed: ADMIN only
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN),
  departmentController.updateStatus
);

export default router;
