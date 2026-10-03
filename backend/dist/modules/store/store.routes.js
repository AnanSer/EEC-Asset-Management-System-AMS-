"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_controller_1 = require("./store.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All store routes require session authentication
router.use((0, middleware_1.requireAuth)());
// GET /api/store/dashboard - Store Keeper Operations Dashboard (STORE_KEEPER & ADMIN)
router.get('/dashboard', (0, middleware_1.requireRole)(constants_1.ROLES.STORE_KEEPER, constants_1.ROLES.ADMIN), store_controller_1.storeController.getDashboard);
// GET /api/store/assets/:assetId/movement-history - Asset chronological movement history
router.get('/assets/:assetId/movement-history', store_controller_1.storeController.getAssetMovementHistory);
exports.default = router;
//# sourceMappingURL=store.routes.js.map