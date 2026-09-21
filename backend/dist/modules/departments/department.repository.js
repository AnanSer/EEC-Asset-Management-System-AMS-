"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentRepository = exports.DepartmentRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class DepartmentRepository {
    async findMany(params) {
        const { search, isActive, skip, take } = params;
        const where = {};
        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }
        if (search && search.trim() !== '') {
            const term = search.trim();
            where.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { code: { contains: term, mode: 'insensitive' } },
                { building: { contains: term, mode: 'insensitive' } },
                { officeLocation: { contains: term, mode: 'insensitive' } },
            ];
        }
        const [departments, total] = await Promise.all([
            prisma_1.default.department.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            employees: true,
                            assets: true,
                        },
                    },
                },
            }),
            prisma_1.default.department.count({ where }),
        ]);
        return { departments, total };
    }
    async findById(id) {
        return prisma_1.default.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true,
                    },
                },
            },
        });
    }
    async findByCode(code) {
        return prisma_1.default.department.findUnique({
            where: { code },
        });
    }
    async create(data) {
        return prisma_1.default.department.create({
            data: {
                name: data.name,
                code: data.code,
                description: data.description,
                location: data.location,
                officeLocation: data.officeLocation,
                building: data.building,
                floor: data.floor,
                headOfDepartment: data.headOfDepartment,
                isActive: data.isActive ?? true,
            },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true,
                    },
                },
            },
        });
    }
    async update(id, data) {
        return prisma_1.default.department.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.code !== undefined && { code: data.code }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.officeLocation !== undefined && { officeLocation: data.officeLocation }),
                ...(data.building !== undefined && { building: data.building }),
                ...(data.floor !== undefined && { floor: data.floor }),
                ...(data.headOfDepartment !== undefined && { headOfDepartment: data.headOfDepartment }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true,
                    },
                },
            },
        });
    }
    async updateStatus(id, isActive) {
        return prisma_1.default.department.update({
            where: { id },
            data: { isActive },
            include: {
                _count: {
                    select: {
                        employees: true,
                        assets: true,
                    },
                },
            },
        });
    }
}
exports.DepartmentRepository = DepartmentRepository;
exports.departmentRepository = new DepartmentRepository();
//# sourceMappingURL=department.repository.js.map