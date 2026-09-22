import { Router } from 'express';
import { assignmentController } from './assignment.controller';

const router = Router();

// Stats endpoint
router.get('/stats', assignmentController.getStats);

// History for an asset
router.get('/history/:assetId', assignmentController.getHistory);

// Assignment lifecycle actions
router.post('/assign', assignmentController.assign);
router.patch('/transfer/:assetId', assignmentController.transfer);
router.patch('/return/:assetId', assignmentController.returnAsset);

// List and single assignment
router.get('/', assignmentController.getAll);
router.get('/:id', assignmentController.getById);

export default router;
