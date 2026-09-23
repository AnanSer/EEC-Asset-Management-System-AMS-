import { Router } from 'express';
import { reportController } from './report.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All reports require authentication
router.use(requireAuth());

// GET /api/reports/dashboard — Executive KPI and charts (ADMIN only)
router.get(
  '/dashboard',
  requireRole(ROLES.ADMIN),
  reportController.getDashboard
);

// GET /api/reports/assets — Asset inventory report (ADMIN only)
router.get(
  '/assets',
  requireRole(ROLES.ADMIN),
  reportController.getAssets
);

// GET /api/reports/employees — Employee assets report (ADMIN only)
router.get(
  '/employees',
  requireRole(ROLES.ADMIN),
  reportController.getEmployees
);

// GET /api/reports/departments — Department asset distribution report (ADMIN & DEPARTMENT_MANAGER)
router.get(
  '/departments',
  requireRole(ROLES.ADMIN, ROLES.DEPARTMENT_MANAGER),
  reportController.getDepartments
);

// GET /api/reports/maintenance — Maintenance analytics report (ADMIN & IT_TECHNICIAN)
router.get(
  '/maintenance',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  reportController.getMaintenance
);

// GET /api/reports/warranty — Warranty expiration report (ADMIN only)
router.get(
  '/warranty',
  requireRole(ROLES.ADMIN),
  reportController.getWarranty
);

export default router;
