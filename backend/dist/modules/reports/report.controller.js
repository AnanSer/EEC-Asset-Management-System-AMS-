"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("./report.service");
const api_1 = require("../../lib/api");
class ReportController {
    constructor(service = report_service_1.reportService) {
        this.service = service;
        this.getDashboard = async (_req, res) => {
            try {
                const data = await this.service.getDashboard();
                return res.status(200).json((0, api_1.successResponse)(data));
            }
            catch (err) {
                console.error('Reports Dashboard Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve reports dashboard metrics', 'INTERNAL_ERROR'));
            }
        };
        this.getAssets = async (req, res) => {
            try {
                const result = await this.service.getAssets(req.query);
                const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
                return res.status(200).json({
                    ...(0, api_1.paginatedResponse)(result.data, pagination),
                    summary: result.summary,
                });
            }
            catch (err) {
                console.error('Reports Assets Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve assets report', 'INTERNAL_ERROR'));
            }
        };
        this.getEmployees = async (req, res) => {
            try {
                const result = await this.service.getEmployees(req.query);
                const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
                return res.status(200).json((0, api_1.paginatedResponse)(result.data, pagination));
            }
            catch (err) {
                console.error('Reports Employees Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve employees report', 'INTERNAL_ERROR'));
            }
        };
        this.getDepartments = async (req, res) => {
            try {
                const result = await this.service.getDepartments(req.query);
                const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
                return res.status(200).json((0, api_1.paginatedResponse)(result.data, pagination));
            }
            catch (err) {
                console.error('Reports Departments Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve departments report', 'INTERNAL_ERROR'));
            }
        };
        this.getMaintenance = async (req, res) => {
            try {
                const result = await this.service.getMaintenance(req.query);
                const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
                return res.status(200).json({
                    ...(0, api_1.paginatedResponse)(result.data, pagination),
                    summary: result.summary,
                });
            }
            catch (err) {
                console.error('Reports Maintenance Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve maintenance report', 'INTERNAL_ERROR'));
            }
        };
        this.getWarranty = async (req, res) => {
            try {
                const result = await this.service.getWarranty(req.query);
                const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
                return res.status(200).json({
                    ...(0, api_1.paginatedResponse)(result.data, pagination),
                    buckets: result.buckets,
                });
            }
            catch (err) {
                console.error('Reports Warranty Error:', err);
                return res.status(500).json((0, api_1.errorResponse)('Failed to retrieve warranty report', 'INTERNAL_ERROR'));
            }
        };
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map