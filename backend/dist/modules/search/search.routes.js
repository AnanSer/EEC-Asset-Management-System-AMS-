"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const router = (0, express_1.Router)();
router.get('/', search_controller_1.searchController.search);
exports.default = router;
//# sourceMappingURL=search.routes.js.map