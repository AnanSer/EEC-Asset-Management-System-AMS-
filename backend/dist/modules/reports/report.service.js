"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const report_repository_1 = require("./report.repository");
class ReportService {
    constructor(repository = report_repository_1.reportRepository) {
        this.repository = repository;
    }
    async getDashboard() {
        return await this.repository.getDashboardMetrics();
    }
    async getAssets(query) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const result = await this.repository.getAssetsReport({
            search: query.search,
            category: query.category,
            status: query.status,
            condition: query.condition,
            departmentId: query.departmentId,
            skip,
            take: limit,
        });
        return {
            data: result.assets,
            summary: {
                totalValue: result.totalValue,
            },
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async getEmployees(query) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        let isActive = undefined;
        if (query.isActive === 'true')
            isActive = true;
        if (query.isActive === 'false')
            isActive = false;
        const result = await this.repository.getEmployeesReport({
            search: query.search,
            departmentId: query.departmentId,
            isActive,
            skip,
            take: limit,
        });
        return {
            data: result.employees,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async getDepartments(query) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        let isActive = undefined;
        if (query.isActive === 'true')
            isActive = true;
        if (query.isActive === 'false')
            isActive = false;
        const result = await this.repository.getDepartmentsReport({
            search: query.search,
            isActive,
            skip,
            take: limit,
        });
        return {
            data: result.departments,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async getMaintenance(query) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const result = await this.repository.getMaintenanceReport({
            search: query.search,
            status: query.status,
            priority: query.priority,
            category: query.category,
            skip,
            take: limit,
        });
        return {
            data: result.tickets,
            summary: {
                totalCost: result.totalCost,
            },
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
    async getWarranty(query) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const result = await this.repository.getWarrantyReport({
            search: query.search,
            timeframe: query.timeframe,
            departmentId: query.departmentId,
            skip,
            take: limit,
        });
        return {
            data: result.assets,
            buckets: result.buckets,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
//# sourceMappingURL=report.service.js.map