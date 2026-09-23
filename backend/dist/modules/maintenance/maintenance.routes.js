"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maintenance_controller_1 = require("./maintenance.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All maintenance routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// Stats must be registered before :id route (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
router.get('/stats', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN, constants_1.ROLES.DEPARTMENT_MANAGER), (req, res) => maintenance_controller_1.maintenanceController.getDashboardStats(req, res));
// List and Create (scoped by role in controller)
router.get('/', (req, res) => maintenance_controller_1.maintenanceController.getTickets(req, res));
router.post('/', (req, res) => maintenance_controller_1.maintenanceController.createTicket(req, res));
// Item details (scoped by canAccessMaintenanceTicket in controller)
router.get('/:id', (req, res) => maintenance_controller_1.maintenanceController.getTicketById(req, res));
// Mutation routes (ADMIN and IT_TECHNICIAN only)
router.put('/:id', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), (req, res) => maintenance_controller_1.maintenanceController.updateTicket(req, res));
router.patch('/:id/status', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), (req, res) => maintenance_controller_1.maintenanceController.updateStatus(req, res));
exports.default = router;
//# sourceMappingURL=maintenance.routes.js.map