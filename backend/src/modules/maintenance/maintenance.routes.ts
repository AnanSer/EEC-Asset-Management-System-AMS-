import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';

const router = Router();

// Stats must be registered before :id route
router.get('/stats', (req, res) => maintenanceController.getDashboardStats(req, res));

// List and Create
router.get('/', (req, res) => maintenanceController.getTickets(req, res));
router.post('/', (req, res) => maintenanceController.createTicket(req, res));

// Item routes
router.get('/:id', (req, res) => maintenanceController.getTicketById(req, res));
router.put('/:id', (req, res) => maintenanceController.updateTicket(req, res));
router.patch('/:id/status', (req, res) => maintenanceController.updateStatus(req, res));

export default router;
