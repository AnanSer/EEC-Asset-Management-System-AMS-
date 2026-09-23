"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("./assignment.controller");
const middleware_1 = require("../../middleware");
const constants_1 = require("../../constants");
const router = (0, express_1.Router)();
// All assignment routes require an authenticated session
router.use((0, middleware_1.requireAuth)());
// Stats endpoint (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER)
router.get('/stats', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN, constants_1.ROLES.DEPARTMENT_MANAGER), assignment_controller_1.assignmentController.getStats);
// History for an asset (scoped by canAccessAsset in controller)
router.get('/history/:assetId', assignment_controller_1.assignmentController.getHistory);
// Assignment lifecycle actions (ADMIN and IT_TECHNICIAN only)
router.post('/assign', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), assignment_controller_1.assignmentController.assign);
router.patch('/transfer/:assetId', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), assignment_controller_1.assignmentController.transfer);
router.patch('/return/:assetId', (0, middleware_1.requireRole)(constants_1.ROLES.ADMIN, constants_1.ROLES.IT_TECHNICIAN), assignment_controller_1.assignmentController.returnAsset);
// List and single assignment (scoped by role in controller)
router.get('/', assignment_controller_1.assignmentController.getAll);
router.get('/:id', assignment_controller_1.assignmentController.getById);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map