"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = exports.ReportController = void 0;
const report_service_1 = require("./report.service");
class ReportController {
    constructor(service = report_service_1.reportService) {
        this.service = service;
        this.getDashboard = async (_req, res) => {
            try {
                const data = await this.service.getDashboard();
                return res.status(200).json({
                    success: true,
                    data,
                });
            }
            catch (err) {
                console.error('Reports Dashboard Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve reports dashboard metrics',
                });
            }
        };
        this.getAssets = async (req, res) => {
            try {
                const result = await this.service.getAssets(req.query);
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    summary: result.summary,
                    meta: result.meta,
                });
            }
            catch (err) {
                console.error('Reports Assets Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve assets report',
                });
            }
        };
        this.getEmployees = async (req, res) => {
            try {
                const result = await this.service.getEmployees(req.query);
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    meta: result.meta,
                });
            }
            catch (err) {
                console.error('Reports Employees Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve employees report',
                });
            }
        };
        this.getDepartments = async (req, res) => {
            try {
                const result = await this.service.getDepartments(req.query);
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    meta: result.meta,
                });
            }
            catch (err) {
                console.error('Reports Departments Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve departments report',
                });
            }
        };
        this.getMaintenance = async (req, res) => {
            try {
                const result = await this.service.getMaintenance(req.query);
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    summary: result.summary,
                    meta: result.meta,
                });
            }
            catch (err) {
                console.error('Reports Maintenance Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve maintenance report',
                });
            }
        };
        this.getWarranty = async (req, res) => {
            try {
                const result = await this.service.getWarranty(req.query);
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    buckets: result.buckets,
                    meta: result.meta,
                });
            }
            catch (err) {
                console.error('Reports Warranty Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve warranty report',
                });
            }
        };
    }
}
exports.ReportController = ReportController;
exports.reportController = new ReportController();
//# sourceMappingURL=report.controller.js.map