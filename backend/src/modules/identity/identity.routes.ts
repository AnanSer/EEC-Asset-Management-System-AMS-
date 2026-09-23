// EEC EAMS – Identity Module Routes (Phase 9A.2 & 9D)
// Routes for authentication and account lifecycle operations.

import { Router } from 'express';
import { identityController } from './identity.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// POST /api/identity/register - Submit employee registration request (Public)
router.post('/register', identityController.register);

// GET /api/identity/pending - List pending account requests (ADMIN only)
router.get(
  '/pending',
  requireAuth(),
  requireRole(ROLES.ADMIN),
  identityController.getPending
);

// PATCH /api/identity/:id/approve - Approve a pending account request (ADMIN only)
router.patch(
  '/:id/approve',
  requireAuth(),
  requireRole(ROLES.ADMIN),
  identityController.approve
);

// PATCH /api/identity/:id/reject - Reject a pending account request (ADMIN only)
router.patch(
  '/:id/reject',
  requireAuth(),
  requireRole(ROLES.ADMIN),
  identityController.reject
);

// PATCH /api/identity/:id/suspend - Suspend an account (ADMIN only)
router.patch(
  '/:id/suspend',
  requireAuth(),
  requireRole(ROLES.ADMIN),
  identityController.suspend
);

export default router;
