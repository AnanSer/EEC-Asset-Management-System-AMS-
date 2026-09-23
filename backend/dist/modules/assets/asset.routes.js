"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asset_controller_1 = require("./asset.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All asset routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// GET /api/assets - list assets (scoped by role in controller)
router.get('/', asset_controller_1.assetController.getAll);
// GET /api/assets/:id - get single asset details (scoped by canAccessAsset in controller)
router.get('/:id', asset_controller_1.assetController.getById);
// POST /api/assets - register a new asset (ADMIN and IT_TECHNICIAN)
router.post('/', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), asset_controller_1.assetController.create);
// PUT /api/assets/:id - update asset details (ADMIN and IT_TECHNICIAN)
router.put('/:id', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), asset_controller_1.assetController.update);
// PATCH /api/assets/:id/status - change asset status (ADMIN and IT_TECHNICIAN)
router.patch('/:id/status', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), asset_controller_1.assetController.updateStatus);
exports.default = router;
//# sourceMappingURL=asset.routes.js.map