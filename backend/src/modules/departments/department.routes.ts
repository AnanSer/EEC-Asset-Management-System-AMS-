import { Router } from 'express';
import { departmentController } from './department.controller';

const router = Router();

// GET /api/departments — List with search, status filter, and pagination
router.get('/', departmentController.getAll);

// GET /api/departments/:id — Single department details
router.get('/:id', departmentController.getById);

// POST /api/departments — Create department
router.post('/', departmentController.create);

// PUT /api/departments/:id — Update department
router.put('/:id', departmentController.update);

// PATCH /api/departments/:id/status — Soft activate/deactivate
router.patch('/:id/status', departmentController.updateStatus);

export default router;
