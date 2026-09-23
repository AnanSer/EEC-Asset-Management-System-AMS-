import { Router } from 'express';
import { employeeController } from './employee.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All employee routes require an authenticated session
router.use(requireAuth());

// GET /api/employees - list employees (scoped by role in controller)
router.get('/', employeeController.getAll);

// GET /api/employees/:id - get single employee details (scoped by ownership in controller)
router.get('/:id', employeeController.getById);

// POST /api/employees - create new employee (ADMIN only)
router.post('/', requireRole(ROLES.ADMIN), employeeController.create);

// PUT /api/employees/:id - update employee details (ADMIN only)
router.put('/:id', requireRole(ROLES.ADMIN), employeeController.update);

// PATCH /api/employees/:id/status - activate or deactivate employee (ADMIN only)
router.patch('/:id/status', requireRole(ROLES.ADMIN), employeeController.updateStatus);

export default router;
