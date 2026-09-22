"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_1 = require("./employee.controller");
const router = (0, express_1.Router)();
// GET /api/employees - list employees with search, department, role, status & pagination
router.get('/', employee_controller_1.employeeController.getAll);
// GET /api/employees/:id - get single employee details
router.get('/:id', employee_controller_1.employeeController.getById);
// POST /api/employees - create new employee (with User & Profile in transaction)
router.post('/', employee_controller_1.employeeController.create);
// PUT /api/employees/:id - update employee details
router.put('/:id', employee_controller_1.employeeController.update);
// PATCH /api/employees/:id/status - activate or deactivate employee
router.patch('/:id/status', employee_controller_1.employeeController.updateStatus);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map