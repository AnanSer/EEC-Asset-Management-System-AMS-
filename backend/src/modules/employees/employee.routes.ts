import { Router } from 'express';
import { employeeController } from './employee.controller';

const router = Router();

// GET /api/employees - list employees with search, department, role, status & pagination
router.get('/', employeeController.getAll);

// GET /api/employees/:id - get single employee details
router.get('/:id', employeeController.getById);

// POST /api/employees - create new employee (with User & Profile in transaction)
router.post('/', employeeController.create);

// PUT /api/employees/:id - update employee details
router.put('/:id', employeeController.update);

// PATCH /api/employees/:id/status - activate or deactivate employee
router.patch('/:id/status', employeeController.updateStatus);

export default router;
