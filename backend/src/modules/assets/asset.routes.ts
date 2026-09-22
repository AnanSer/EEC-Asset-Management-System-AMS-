import { Router } from 'express';
import { assetController } from './asset.controller';

const router = Router();

// GET /api/assets - list assets with search, category, status, condition & pagination
router.get('/', assetController.getAll);

// GET /api/assets/:id - get single asset details
router.get('/:id', assetController.getById);

// POST /api/assets - register a new asset
router.post('/', assetController.create);

// PUT /api/assets/:id - update asset details
router.put('/:id', assetController.update);

// PATCH /api/assets/:id/status - change asset status
router.patch('/:id/status', assetController.updateStatus);

export default router;
