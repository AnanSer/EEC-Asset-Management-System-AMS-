// EEC EAMS – Identity Module Routes (Phase 9A.2)
// Prepared routes for authentication and account lifecycle operations.

import { Router } from 'express';
import { identityController } from './identity.controller';

const router = Router();

// POST /api/identity/register - Submit employee registration request
router.post('/register', identityController.register);

// GET /api/identity/pending - List pending account requests awaiting administrator approval
router.get('/pending', identityController.getPending);

// PATCH /api/identity/:id/approve - Approve a pending account request
router.patch('/:id/approve', identityController.approve);

// PATCH /api/identity/:id/reject - Reject a pending account request
router.patch('/:id/reject', identityController.reject);

export default router;
