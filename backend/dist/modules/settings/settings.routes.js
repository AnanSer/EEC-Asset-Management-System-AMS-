"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const requirePermission_1 = require("../../middleware/requirePermission");
const permissions_1 = require("../../constants/permissions");
const router = (0, express_1.Router)();
// All settings routes require authentication
router.use((0, auth_middleware_1.requireAuth)());
// GET /api/settings — View current settings (All authenticated users)
router.get('/', settings_controller_1.settingsController.getSettings);
// PATCH /api/settings — Update settings (ADMIN only via SETTINGS_UPDATE permission)
router.patch('/', (0, requirePermission_1.requirePermission)(permissions_1.PERMISSIONS.SETTINGS_UPDATE), settings_controller_1.settingsController.updateSettings);
// GET /api/settings/system-info — System information (All authenticated users)
router.get('/system-info', settings_controller_1.settingsController.getSystemInfo);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map