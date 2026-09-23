"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("./employee.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All employee routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// GET /api/employees - list employees (scoped by role in controller)
router.get('/', employee_controller_1.employeeController.getAll);
// GET /api/employees/:id - get single employee details (scoped by ownership in controller)
router.get('/:id', employee_controller_1.employeeController.getById);
// POST /api/employees - create new employee (ADMIN only)
router.post('/', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), employee_controller_1.employeeController.create);
// PUT /api/employees/:id - update employee details (ADMIN only)
router.put('/:id', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), employee_controller_1.employeeController.update);
// PATCH /api/employees/:id/status - activate or deactivate employee (ADMIN only)
router.patch('/:id/status', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), employee_controller_1.employeeController.updateStatus);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map