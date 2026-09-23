"use strict";
// EEC EAMS – Identity Module Service (Phase 9A.2 & 9B)
// Authentication and account lifecycle business logic integrated with Better Auth.
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityService = exports.IdentityService = exports.AppError = void 0;
const identity_repository_1 = require("./identity.repository");
const client_1 = require("@prisma/client");
const auth_1 = require("../../lib/auth");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class IdentityService {
    constructor(repo = identity_repository_1.identityRepository) {
        this.repo = repo;
    }
    formatPendingUser(user) {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: Boolean(user.isEmailVerified),
            createdAt: user.createdAt,
            employeeProfile: user.employeeProfile
                ? {
                    id: user.employeeProfile.id,
                    employeeId: user.employeeProfile.employeeId,
                    firstName: user.employeeProfile.firstName,
                    lastName: user.employeeProfile.lastName,
                    fullName: `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`.trim(),
                    phone: user.employeeProfile.phone,
                    jobTitle: user.employeeProfile.jobTitle,
                    departmentId: user.employeeProfile.departmentId,
                    departmentName: user.employeeProfile.department?.name,
                    officeLocation: user.employeeProfile.officeLocation,
                }
                : null,
        };
    }
    /**
     * List pending account requests with search, department filtering, and pagination.
     */
    async getPendingUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.repo.findPendingUsers({
                skip,
                take: limit,
                search: query.search?.trim(),
                departmentId: query.departmentId,
            }),
            this.repo.countPendingUsers({
                search: query.search?.trim(),
                departmentId: query.departmentId,
            }),
        ]);
        return {
            users: users.map((u) => this.formatPendingUser(u)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    /**
     * Submit an employee registration request.
     * Creates Better Auth credentials and pending business user + employee profile.
     */
    async register(data) {
        // 1. Check for existing business user email
        const existingUser = await this.repo.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError('An account with this email address already exists', 409);
        }
        // 2. Check for existing employee ID
        const existingProfile = await this.repo.findProfileByEmployeeId(data.employeeId);
        if (existingProfile) {
            throw new AppError('An employee profile with this ID already exists', 409);
        }
        // 3. Register user with Better Auth for credential management
        try {
            await auth_1.auth.api.signUpEmail({
                body: {
                    email: data.email,
                    password: data.password,
                    name: data.fullName,
                },
            });
        }
        catch (authErr) {
            if (authErr?.message?.includes('already exists') || authErr?.status === 400) {
                throw new AppError('An account with this email address already exists in authentication system', 409);
            }
            console.error('[IdentityService.register] Better Auth sign-up error:', authErr);
            throw new AppError(authErr?.message || 'Failed to create authentication credentials', 400);
        }
        const nameParts = data.fullName.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];
        const requestedRole = (data.requestedRole || 'EMPLOYEE');
        const created = await this.repo.createRegistrationRequest({
            email: data.email,
            passwordHash: 'BETTER_AUTH_MANAGED',
            role: requestedRole,
            firstName,
            lastName,
            employeeId: data.employeeId,
            departmentId: data.departmentId,
            jobTitle: data.position,
            phone: data.phone,
            officeLocation: data.officeLocation,
        });
        return {
            message: 'Registration request submitted successfully. Awaiting administrator approval.',
            user: this.formatPendingUser(created),
        };
    }
    /**
     * Approve a pending user account.
     */
    async approveAccount(id, data) {
        const user = await this.repo.findUserById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        if (user.status !== client_1.AccountStatus.PENDING) {
            throw new AppError(`Cannot approve user with status '${user.status}'`, 400);
        }
        const role = (data.role || user.role);
        const updated = await this.repo.updateAccountStatus(id, client_1.AccountStatus.APPROVED, role);
        return {
            message: 'Account approved successfully',
            user: this.formatPendingUser(updated),
        };
    }
    /**
     * Reject a pending user account.
     */
    async rejectAccount(id, data) {
        const user = await this.repo.findUserById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        if (user.status !== client_1.AccountStatus.PENDING) {
            throw new AppError(`Cannot reject user with status '${user.status}'`, 400);
        }
        const updated = await this.repo.updateAccountStatus(id, client_1.AccountStatus.REJECTED);
        return {
            message: 'Account request rejected',
            reason: data.reason,
            user: this.formatPendingUser(updated),
        };
    }
    /**
     * Suspend user account (Future use placeholder).
     */
    async suspendAccount(id) {
        const user = await this.repo.findUserById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        const updated = await this.repo.updateAccountStatus(id, client_1.AccountStatus.SUSPENDED);
        return {
            message: 'Account suspended successfully',
            user: this.formatPendingUser(updated),
        };
    }
}
exports.IdentityService = IdentityService;
exports.identityService = new IdentityService();
//# sourceMappingURL=identity.service.js.map