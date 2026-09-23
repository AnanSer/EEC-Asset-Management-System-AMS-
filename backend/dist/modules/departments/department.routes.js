"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = require("./department.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All department routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// GET /api/departments — List with search, status filter, and pagination
// Allowed: ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER
router.get('/', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN, constants_1.ROLES.DEPARTMENT_MANAGER), department_controller_1.departmentController.getAll);
// GET /api/departments/:id — Single department details
// Allowed: ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER
router.get('/:id', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN, constants_1.ROLES.DEPARTMENT_MANAGER), department_controller_1.departmentController.getById);
// POST /api/departments — Create department
// Allowed: ADMIN only
router.post('/', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), department_controller_1.departmentController.create);
// PUT /api/departments/:id — Update department
// Allowed: ADMIN only
router.put('/:id', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), department_controller_1.departmentController.update);
// PATCH /api/departments/:id/status — Soft activate/deactivate
// Allowed: ADMIN only
router.patch('/:id/status', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), department_controller_1.departmentController.updateStatus);
exports.default = router;
//# sourceMappingURL=department.routes.js.map