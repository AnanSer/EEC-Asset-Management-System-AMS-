"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request_controller_1 = require("./request.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All request routes require authentication
router.use((0, middleware_1.requireAuth)());
// GET /api/requests - list requests (scoped by role in service)
router.get('/', (req, res) => request_controller_1.requestController.getAll(req, res));
// POST /api/requests - submit a new asset request
router.post('/', (req, res) => request_controller_1.requestController.create(req, res));
// GET /api/requests/:id - view single request details
router.get('/:id', (req, res) => request_controller_1.requestController.getById(req, res));
// POST /api/requests/:id/approve - approve request (ADMIN only)
router.post('/:id/approve', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), (req, res) => request_controller_1.requestController.approve(req, res));
// POST /api/requests/:id/reject - reject request (ADMIN only)
router.post('/:id/reject', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), (req, res) => request_controller_1.requestController.reject(req, res));
// POST /api/requests/:id/fulfill - fulfill request with physical handover (STORE_KEEPER & ADMIN)
router.post('/:id/fulfill', (0, middleware_1.requireRole)(constants_1.ROLES.STORE_KEEPER, constants_1.ROLES.ADMIN), (req, res) => request_controller_1.requestController.fulfill(req, res));
// POST /api/requests/:id/cancel - cancel pending request (requester only)
router.post('/:id/cancel', (req, res) => request_controller_1.requestController.cancel(req, res));
exports.default = router;
//# sourceMappingURL=request.routes.js.map