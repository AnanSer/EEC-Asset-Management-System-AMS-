"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All reports require authentication
router.use((0, middleware_1.requireAuth)());
// GET /api/reports/dashboard — Executive KPI and charts (ADMIN only)
router.get('/dashboard', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), report_controller_1.reportController.getDashboard);
// GET /api/reports/assets — Asset inventory report (ADMIN only)
router.get('/assets', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), report_controller_1.reportController.getAssets);
// GET /api/reports/employees — Employee assets report (ADMIN only)
router.get('/employees', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), report_controller_1.reportController.getEmployees);
// GET /api/reports/departments — Department asset distribution report (ADMIN & DEPARTMENT_MANAGER)
router.get('/departments', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.DEPARTMENT_MANAGER), report_controller_1.reportController.getDepartments);
// GET /api/reports/maintenance — Maintenance analytics report (ADMIN & IT_TECHNICIAN)
router.get('/maintenance', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), report_controller_1.reportController.getMaintenance);
// GET /api/reports/warranty — Warranty expiration report (ADMIN only)
router.get('/warranty', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN), report_controller_1.reportController.getWarranty);
exports.default = router;
//# sourceMappingURL=report.routes.js.map