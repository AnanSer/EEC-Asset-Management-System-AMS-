import { Router } from 'express';
import { requestController } from './request.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All request routes require authentication
router.use(requireAuth());

// GET /api/requests - list requests (scoped by role in service)
router.get('/', (req, res) => requestController.getAll(req, res));

// POST /api/requests - submit a new asset request
router.post('/', (req, res) => requestController.create(req, res));

// GET /api/requests/:id - view single request details
router.get('/:id', (req, res) => requestController.getById(req, res));

// POST /api/requests/:id/approve - approve request (ADMIN only)
router.post(
  '/:id/approve',
  requireRole(ROLES.ADMIN),
  (req, res) => requestController.approve(req, res)
);

// POST /api/requests/:id/reject - reject request (ADMIN only)
router.post(
  '/:id/reject',
  requireRole(ROLES.ADMIN),
  (req, res) => requestController.reject(req, res)
);

// POST /api/requests/:id/fulfill - fulfill request with physical handover (STORE_KEEPER & ADMIN)
router.post(
  '/:id/fulfill',
  requireRole(ROLES.STORE_KEEPER, ROLES.ADMIN),
  (req, res) => requestController.fulfill(req, res)
);

// POST /api/requests/:id/cancel - cancel pending request (requester only)
router.post('/:id/cancel', (req, res) => requestController.cancel(req, res));

export default router;
