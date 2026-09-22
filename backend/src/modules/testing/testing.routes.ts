import { Router } from 'express';
import { testingController } from './testing.controller';

const router = Router();

router.get('/:ticketId', (req, res) => testingController.getInspectionsByTicket(req, res));
router.post('/', (req, res) => testingController.createInspection(req, res));
router.put('/:id', (req, res) => testingController.updateInspection(req, res));

export default router;
