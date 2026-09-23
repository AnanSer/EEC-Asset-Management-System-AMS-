"use strict";
// EEC EAMS – Identity Module Routes (Phase 9A.2)
// Prepared routes for authentication and account lifecycle operations.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identity_controller_1 = require("./identity.controller");
const router = (0, express_1.Router)();
// POST /api/identity/register - Submit employee registration request
router.post('/register', identity_controller_1.identityController.register);
// GET /api/identity/pending - List pending account requests awaiting administrator approval
router.get('/pending', identity_controller_1.identityController.getPending);
// PATCH /api/identity/:id/approve - Approve a pending account request
router.patch('/:id/approve', identity_controller_1.identityController.approve);
// PATCH /api/identity/:id/reject - Reject a pending account request
router.patch('/:id/reject', identity_controller_1.identityController.reject);
exports.default = router;
//# sourceMappingURL=identity.routes.js.map