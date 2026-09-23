"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const middleware_1 = require("../../middleware");
const router = (0, express_1.Router)();
router.use((0, middleware_1.requireAuth)());
router.get('/', search_controller_1.searchController.search);
exports.default = router;
//# sourceMappingURL=search.routes.js.map