"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = exports.SearchController = void 0;
const search_service_1 = require("./search.service");
const api_1 = require("../../lib/api");
class SearchController {
    constructor(service = search_service_1.searchService) {
        this.service = service;
        this.search = async (req, res) => {
            try {
                const q = typeof req.query.q === 'string' ? req.query.q : '';
                const data = await this.service.search(q);
                return res.status(200).json((0, api_1.successResponse)(data));
            }
            catch (err) {
                console.error('Unhandled Search Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Internal server error', 'INTERNAL_ERROR'));
            }
        };
    }
}
exports.SearchController = SearchController;
exports.searchController = new SearchController();
//# sourceMappingURL=search.controller.js.map