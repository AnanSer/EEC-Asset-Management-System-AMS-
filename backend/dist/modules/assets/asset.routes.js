"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = require("./asset.controller");
const router = (0, express_1.Router)();
// GET /api/assets - list assets with search, category, status, condition & pagination
router.get('/', asset_controller_1.assetController.getAll);
// GET /api/assets/:id - get single asset details
router.get('/:id', asset_controller_1.assetController.getById);
// POST /api/assets - register a new asset
router.post('/', asset_controller_1.assetController.create);
// PUT /api/assets/:id - update asset details
router.put('/:id', asset_controller_1.assetController.update);
// PATCH /api/assets/:id/status - change asset status
router.patch('/:id/status', asset_controller_1.assetController.updateStatus);
exports.default = router;
//# sourceMappingURL=asset.routes.js.map