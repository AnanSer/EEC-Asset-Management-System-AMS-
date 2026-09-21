"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("./department.controller");
const router = (0, express_1.Router)();
// GET /api/departments — List with search, status filter, and pagination
router.get('/', department_controller_1.departmentController.getAll);
// GET /api/departments/:id — Single department details
router.get('/:id', department_controller_1.departmentController.getById);
// POST /api/departments — Create department
router.post('/', department_controller_1.departmentController.create);
// PUT /api/departments/:id — Update department
router.put('/:id', department_controller_1.departmentController.update);
// PATCH /api/departments/:id/status — Soft activate/deactivate
router.patch('/:id/status', department_controller_1.departmentController.updateStatus);
exports.default = router;
//# sourceMappingURL=department.routes.js.map