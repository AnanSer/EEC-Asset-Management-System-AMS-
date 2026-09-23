import { Router } from 'express';
import { maintenanceController } from './maintenance.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// All maintenance routes require an authenticated session
router.use(requireAuth());

// Stats must be registered before :id route (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
router.get(
  '/stats',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN, ROLES.DEPARTMENT_MANAGER),
  (req, res) => maintenanceController.getDashboardStats(req, res)
);

// List and Create (scoped by role in controller)
router.get('/', (req, res) => maintenanceController.getTickets(req, res));
router.post('/', (req, res) => maintenanceController.createTicket(req, res));

// Technicians list for assignment dropdown (all authenticated users)
router.get('/technicians', (req, res) => maintenanceController.getTechnicians(req, res));

// Item details (scoped by canAccessMaintenanceTicket in controller)
router.get('/:id', (req, res) => maintenanceController.getTicketById(req, res));

// Mutation routes (ADMIN and IT_TECHNICIAN only)
router.put(
  '/:id',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  (req, res) => maintenanceController.updateTicket(req, res)
);
router.patch(
  '/:id/status',
  requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN),
  (req, res) => maintenanceController.updateStatus(req, res)
);

export default router;
