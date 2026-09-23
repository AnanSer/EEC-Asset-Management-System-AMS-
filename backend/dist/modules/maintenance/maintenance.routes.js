"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenance_controller_1 = require("./maintenance.controller");
const router = (0, express_1.Router)();
// Stats must be registered before :id route
router.get('/stats', (req, res) => maintenance_controller_1.maintenanceController.getDashboardStats(req, res));
// List and Create
router.get('/', (req, res) => maintenance_controller_1.maintenanceController.getTickets(req, res));
router.post('/', (req, res) => maintenance_controller_1.maintenanceController.createTicket(req, res));
// Item routes
router.get('/:id', (req, res) => maintenance_controller_1.maintenanceController.getTicketById(req, res));
router.put('/:id', (req, res) => maintenance_controller_1.maintenanceController.updateTicket(req, res));
router.patch('/:id/status', (req, res) => maintenance_controller_1.maintenanceController.updateStatus(req, res));
exports.default = router;
//# sourceMappingURL=maintenance.routes.js.map