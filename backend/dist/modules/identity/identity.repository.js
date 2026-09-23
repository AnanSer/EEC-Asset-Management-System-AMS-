"use strict";
// EEC EAMS – Identity Module Repository (Phase 9A.2)
// Data access layer for User account lifecycle operations.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityRepository = exports.IdentityRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class IdentityRepository {
    /**
     * Find pending user accounts with optional search, department filter, and pagination.
     */
    async findPendingUsers(params) {
        const { skip, take, search, departmentId } = params;
        const where = {
            status: client_1.AccountStatus.PENDING,
        };
        if (departmentId) {
            where.employeeProfile = {
                departmentId,
            };
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    employeeProfile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { employeeId: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }
        return prisma_1.default.user.findMany({
            where,
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                employeeProfile: {
                    include: {
                        department: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    /**
     * Count total pending users matching criteria.
     */
    async countPendingUsers(params) {
        const { search, departmentId } = params;
        const where = {
            status: client_1.AccountStatus.PENDING,
        };
        if (departmentId) {
            where.employeeProfile = {
                departmentId,
            };
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    employeeProfile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                            { employeeId: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            ];
        }
        return prisma_1.default.user.count({ where });
    }
    /**
     * Find user by unique ID with profile and department.
     */
    async findUserById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
            include: {
                employeeProfile: {
                    include: {
                        department: true,
                    },
                },
            },
        });
    }
    /**
     * Find user by unique email address.
     */
    async findUserByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email },
        });
    }
    /**
     * Find employee profile by employeeId.
     */
    async findProfileByEmployeeId(employeeId) {
        return prisma_1.default.employeeProfile.findUnique({
            where: { employeeId },
        });
    }
    /**
     * Create a pending user with employee profile in a transaction.
     */
    async createRegistrationRequest(data) {
        return prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: data.passwordHash,
                    role: data.role,
                    status: client_1.AccountStatus.PENDING,
                    isEmailVerified: false,
                },
            });
            const profile = await tx.employeeProfile.create({
                data: {
                    userId: user.id,
                    employeeId: data.employeeId,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    jobTitle: data.jobTitle,
                    departmentId: data.departmentId,
                    phone: data.phone,
                    officeLocation: data.officeLocation,
                    isActive: false, // Inactive until account is approved
                },
                include: {
                    department: true,
                },
            });
            return {
                ...user,
                employeeProfile: profile,
            };
        });
    }
    /**
     * Update account status (e.g. APPROVED, REJECTED, SUSPENDED) and optionally role.
     */
    async updateAccountStatus(id, status, role) {
        return prisma_1.default.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id },
                data: {
                    status,
                    ...(role && { role }),
                },
                include: {
                    employeeProfile: {
                        include: {
                            department: true,
                        },
                    },
                },
            });
            // Synchronize employee active state if profile exists
            if (user.employeeProfile) {
                await tx.employeeProfile.update({
                    where: { id: user.employeeProfile.id },
                    data: {
                        isActive: status === client_1.AccountStatus.APPROVED,
                    },
                });
            }
            return user;
        });
    }
}
exports.IdentityRepository = IdentityRepository;
exports.identityRepository = new IdentityRepository();
//# sourceMappingURL=identity.repository.js.map