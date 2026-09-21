"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = exports.DepartmentService = exports.AppError = void 0;
const department_repository_1 = require("./department.repository");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class DepartmentService {
    constructor(repo = department_repository_1.departmentRepository) {
        this.repo = repo;
    }
    async getDepartments(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        let isActive = undefined;
        if (query.status === 'active')
            isActive = true;
        if (query.status === 'inactive')
            isActive = false;
        const { departments, total } = await this.repo.findMany({
            search: query.search,
            isActive,
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            departments,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async getDepartmentById(id) {
        const department = await this.repo.findById(id);
        if (!department) {
            throw new AppError(`Department with ID '${id}' not found`, 404);
        }
        return department;
    }
    async createDepartment(data) {
        const existing = await this.repo.findByCode(data.code);
        if (existing) {
            throw new AppError(`Department code '${data.code}' is already in use`, 409);
        }
        return this.repo.create(data);
    }
    async updateDepartment(id, data) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new AppError(`Department with ID '${id}' not found`, 404);
        }
        if (data.code && data.code !== existing.code) {
            const codeTaken = await this.repo.findByCode(data.code);
            if (codeTaken) {
                throw new AppError(`Department code '${data.code}' is already in use`, 409);
            }
        }
        return this.repo.update(id, data);
    }
    async updateStatus(id, isActive) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new AppError(`Department with ID '${id}' not found`, 404);
        }
        return this.repo.updateStatus(id, isActive);
    }
}
exports.DepartmentService = DepartmentService;
exports.departmentService = new DepartmentService();
//# sourceMappingURL=department.service.js.map