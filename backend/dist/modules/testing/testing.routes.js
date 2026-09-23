"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testing_controller_1 = require("./testing.controller");
const router = (0, express_1.Router)();
router.get('/:ticketId', (req, res) => testing_controller_1.testingController.getInspectionsByTicket(req, res));
router.post('/', (req, res) => testing_controller_1.testingController.createInspection(req, res));
router.put('/:id', (req, res) => testing_controller_1.testingController.updateInspection(req, res));
exports.default = router;
//# sourceMappingURL=testing.routes.js.map