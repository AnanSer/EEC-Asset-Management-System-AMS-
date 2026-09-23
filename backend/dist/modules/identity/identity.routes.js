"use strict";
// EEC EAMS – Identity Module Routes (Phase 9A.2 & 9D)
// Routes for authentication and account lifecycle operations.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identity_controller_1 = require("./identity.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// POST /api/identity/register - Submit employee registration request (Public)
router.post('/register', identity_controller_1.identityController.register);
// GET /api/identity/pending - List pending account requests (ADMIN only)
router.get('/pending', (0, middleware_1.requireAuth)(), (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), identity_controller_1.identityController.getPending);
// PATCH /api/identity/:id/approve - Approve a pending account request (ADMIN only)
router.patch('/:id/approve', (0, middleware_1.requireAuth)(), (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), identity_controller_1.identityController.approve);
// PATCH /api/identity/:id/reject - Reject a pending account request (ADMIN only)
router.patch('/:id/reject', (0, middleware_1.requireAuth)(), (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), identity_controller_1.identityController.reject);
// PATCH /api/identity/:id/suspend - Suspend an account (ADMIN only)
router.patch('/:id/suspend', (0, middleware_1.requireAuth)(), (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), identity_controller_1.identityController.suspend);
exports.default = router;
//# sourceMappingURL=identity.routes.js.map