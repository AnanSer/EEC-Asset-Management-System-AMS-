"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignment_controller_1 = require("./assignment.controller");
const router = (0, express_1.Router)();
// Stats endpoint
router.get('/stats', assignment_controller_1.assignmentController.getStats);
// History for an asset
router.get('/history/:assetId', assignment_controller_1.assignmentController.getHistory);
// Assignment lifecycle actions
router.post('/assign', assignment_controller_1.assignmentController.assign);
router.patch('/transfer/:assetId', assignment_controller_1.assignmentController.transfer);
router.patch('/return/:assetId', assignment_controller_1.assignmentController.returnAsset);
// List and single assignment
router.get('/', assignment_controller_1.assignmentController.getAll);
router.get('/:id', assignment_controller_1.assignmentController.getById);
exports.default = router;
//# sourceMappingURL=assignment.routes.js.map