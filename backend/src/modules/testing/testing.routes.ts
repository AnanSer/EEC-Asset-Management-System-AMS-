import { Router } from 'express';
import { testingController } from './testing.controller';
import { requireAuth, requireRole } from '../../middleware';
import { ROLES } from '../../constants';

const router = Router();

// Testing inspections are restricted to ADMIN and IT_TECHNICIAN
router.use(requireAuth());
router.use(requireRole(ROLES.ADMIN, ROLES.IT_TECHNICIAN));

router.get('/:ticketId', (req, res) => testingController.getInspectionsByTicket(req, res));
router.post('/', (req, res) => testingController.createInspection(req, res));
router.put('/:id', (req, res) => testingController.updateInspection(req, res));

export default router;
