"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const router = (0, express_1.Router)();
router.get('/dashboard', report_controller_1.reportController.getDashboard);
router.get('/assets', report_controller_1.reportController.getAssets);
router.get('/employees', report_controller_1.reportController.getEmployees);
router.get('/departments', report_controller_1.reportController.getDepartments);
router.get('/maintenance', report_controller_1.reportController.getMaintenance);
router.get('/warranty', report_controller_1.reportController.getWarranty);
exports.default = router;
//# sourceMappingURL=report.routes.js.map