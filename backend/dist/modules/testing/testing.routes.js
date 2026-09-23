"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testing_controller_1 = require("./testing.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// Testing inspections are restricted to ADMIN and IT_TECHNICIAN
router.use((0, middleware_1.requireAuth)());
router.use((0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN));
router.get('/:ticketId', (req, res) => testing_controller_1.testingController.getInspectionsByTicket(req, res));
router.post('/', (req, res) => testing_controller_1.testingController.createInspection(req, res));
router.put('/:id', (req, res) => testing_controller_1.testingController.updateInspection(req, res));
exports.default = router;
//# sourceMappingURL=testing.routes.js.map