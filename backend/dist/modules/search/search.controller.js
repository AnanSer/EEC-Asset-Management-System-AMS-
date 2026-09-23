"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchController = exports.SearchController = void 0;
const search_service_1 = require("./search.service");
class SearchController {
    constructor(service = search_service_1.searchService) {
        this.service = service;
        this.search = async (req, res) => {
            try {
                const q = typeof req.query.q === 'string' ? req.query.q : '';
                const data = await this.service.search(q);
                return res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (err) {
                console.error('Unhandled Search Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
    }
}
exports.SearchController = SearchController;
exports.searchController = new SearchController();
//# sourceMappingURL=search.controller.js.map