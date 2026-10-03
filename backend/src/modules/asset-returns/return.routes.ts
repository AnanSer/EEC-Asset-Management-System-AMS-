import { Router } from 'express';
import { returnController } from './return.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All return routes require authentication
router.use(requireAuth());

// GET /api/returns - list return requests (scoped by role in service)
router.get('/', (req, res) => returnController.getAll(req, res));

// POST /api/returns - submit a new return request (EMPLOYEE, DEPARTMENT_MANAGER, IT_TECHNICIAN, STORE_KEEPER, ADMIN)
router.post('/', (req, res) => returnController.create(req, res));

// POST /api/returns/walk-in - walk-in direct physical return (STORE_KEEPER & ADMIN)
router.post(
  '/walk-in',
  requireRole(ROLES.STORE_KEEPER, ROLES.ADMIN),
  (req, res) => returnController.receiveWalkIn(req, res)
);

// GET /api/returns/:id - view single return request details
router.get('/:id', (req, res) => returnController.getById(req, res));

// POST /api/returns/:id/receive - receive physical asset return (STORE_KEEPER & ADMIN)
router.post(
  '/:id/receive',
  requireRole(ROLES.STORE_KEEPER, ROLES.ADMIN),
  (req, res) => returnController.receive(req, res)
);

// POST /api/returns/:id/cancel - cancel pending return request (Requester or ADMIN)
router.post('/:id/cancel', (req, res) => returnController.cancel(req, res));

export default router;
