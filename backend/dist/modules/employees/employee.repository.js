"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeRepository = exports.EmployeeRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class EmployeeRepository {
    async findMany(params) {
        const { search, departmentId, role, isActive, skip, take } = params;
        const where = {};
        if (departmentId && departmentId !== 'all') {
            where.departmentId = departmentId;
        }
        if (role && role !== 'all') {
            where.user = {
                ...where.user,
                role: role,
            };
        }
        if (typeof isActive === 'boolean') {
            where.isActive = isActive;
        }
        if (search && search.trim() !== '') {
            const term = search.trim();
            where.OR = [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
                { employeeId: { contains: term, mode: 'insensitive' } },
                { jobTitle: { contains: term, mode: 'insensitive' } },
                { user: { email: { contains: term, mode: 'insensitive' } } },
            ];
        }
        const [employees, total] = await Promise.all([
            prisma_1.default.employeeProfile.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                            isEmailVerified: true,
                            createdAt: true,
                        },
                    },
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            location: true,
                            officeLocation: true,
                            building: true,
                            floor: true,
                        },
                    },
                    _count: {
                        select: {
                            assetAssignments: true,
                        },
                    },
                },
            }),
            prisma_1.default.employeeProfile.count({ where }),
        ]);
        return { employees, total };
    }
    async findById(id) {
        return prisma_1.default.employeeProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
                department: true,
                _count: {
                    select: {
                        assetAssignments: true,
                    },
                },
            },
        });
    }
    async findByEmployeeId(employeeId) {
        return prisma_1.default.employeeProfile.findUnique({
            where: { employeeId },
        });
    }
    async findUserByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    async createWithTransaction(data) {
        // Split full name into first and last name
        const nameParts = data.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '-';
        return prisma_1.default.$transaction(async (tx) => {
            // 1. Create User
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    role: data.role,
                    status: client_1.AccountStatus.PENDING,
                    isEmailVerified: false,
                    passwordHash: '$2b$10$placeholder.for.future.auth.module',
                },
            });
            // 2. Create Employee Profile linked to User
            const profile = await tx.employeeProfile.create({
                data: {
                    userId: user.id,
                    employeeId: data.employeeId,
                    firstName,
                    lastName,
                    phone: data.phone,
                    jobTitle: data.position,
                    departmentId: data.departmentId,
                    officeLocation: data.officeLocation,
                    isActive: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                            isEmailVerified: true,
                            createdAt: true,
                        },
                    },
                    department: true,
                    _count: {
                        select: {
                            assetAssignments: true,
                        },
                    },
                },
            });
            return profile;
        });
    }
    async updateWithTransaction(id, currentProfile, data) {
        let firstName = undefined;
        let lastName = undefined;
        if (data.fullName !== undefined) {
            const nameParts = data.fullName.trim().split(/\s+/);
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '-';
        }
        return prisma_1.default.$transaction(async (tx) => {
            // Update User if email or role changed
            if (data.email !== undefined || data.role !== undefined) {
                await tx.user.update({
                    where: { id: currentProfile.userId },
                    data: {
                        ...(data.email !== undefined && { email: data.email }),
                        ...(data.role !== undefined && { role: data.role }),
                    },
                });
            }
            // Update EmployeeProfile
            const updated = await tx.employeeProfile.update({
                where: { id },
                data: {
                    ...(firstName !== undefined && { firstName }),
                    ...(lastName !== undefined && { lastName }),
                    ...(data.employeeId !== undefined && { employeeId: data.employeeId }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.position !== undefined && { jobTitle: data.position }),
                    ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
                    ...(data.officeLocation !== undefined && { officeLocation: data.officeLocation }),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            status: true,
                            isEmailVerified: true,
                            createdAt: true,
                        },
                    },
                    department: true,
                    _count: {
                        select: {
                            assetAssignments: true,
                        },
                    },
                },
            });
            return updated;
        });
    }
    async updateStatus(id, isActive) {
        return prisma_1.default.employeeProfile.update({
            where: { id },
            data: { isActive },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                        isEmailVerified: true,
                        createdAt: true,
                    },
                },
                department: true,
                _count: {
                    select: {
                        assetAssignments: true,
                    },
                },
            },
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
exports.employeeRepository = new EmployeeRepository();
//# sourceMappingURL=employee.repository.js.map