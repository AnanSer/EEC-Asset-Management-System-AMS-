"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const return_controller_1 = require("./return.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All return routes require authentication
router.use((0, middleware_1.requireAuth)());
// GET /api/returns - list return requests (scoped by role in service)
router.get('/', (req, res) => return_controller_1.returnController.getAll(req, res));
// POST /api/returns - submit a new return request (EMPLOYEE, DEPARTMENT_MANAGER, IT_TECHNICIAN, STORE_KEEPER, ADMIN)
router.post('/', (req, res) => return_controller_1.returnController.create(req, res));
// POST /api/returns/walk-in - walk-in direct physical return (STORE_KEEPER & ADMIN)
router.post('/walk-in', (0, middleware_1.requireRole)(constants_1.ROLES.STORE_KEEPER, constants_1.ROLES.ADMIN), (req, res) => return_controller_1.returnController.receiveWalkIn(req, res));
// GET /api/returns/:id - view single return request details
router.get('/:id', (req, res) => return_controller_1.returnController.getById(req, res));
// POST /api/returns/:id/receive - receive physical asset return (STORE_KEEPER & ADMIN)
router.post('/:id/receive', (0, middleware_1.requireRole)(constants_1.ROLES.STORE_KEEPER, constants_1.ROLES.ADMIN), (req, res) => return_controller_1.returnController.receive(req, res));
// POST /api/returns/:id/cancel - cancel pending return request (Requester or ADMIN)
router.post('/:id/cancel', (req, res) => return_controller_1.returnController.cancel(req, res));
exports.default = router;
//# sourceMappingURL=return.routes.js.map