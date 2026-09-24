// EEC EAMS – Identity Module Service (Phase 9A.2 & 9B)
// Authentication and account lifecycle business logic integrated with Better Auth.

import { identityRepository, IdentityRepository } from './identity.repository';
import {
  RegistrationRequestDTO,
  ApprovalRequestDTO,
  RejectionRequestDTO,
  PendingUserQueryDTO,
  PendingUserResponse,
} from './identity.validator';
import { AccountStatus, UserRole } from '@prisma/client';
import { auth } from '../../lib/auth';
import prisma from '../../lib/prisma';
import { sendWelcomeApprovedEmail } from '../../lib/email';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class IdentityService {
  constructor(private repo: IdentityRepository = identityRepository) {}

  private formatPendingUser(user: any): PendingUserResponse {
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
  async getPendingUsers(query: PendingUserQueryDTO) {
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
  async register(data: RegistrationRequestDTO) {
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
      await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.fullName,
        },
      });
    } catch (authErr: any) {
      if (authErr?.message?.includes('already exists') || authErr?.status === 400) {
        throw new AppError('An account with this email address already exists in authentication system', 409);
      }
      console.error('[IdentityService.register] Better Auth sign-up error:', authErr);
      throw new AppError(authErr?.message || 'Failed to create authentication credentials', 400);
    }

    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    const requestedRole = (data.requestedRole || 'EMPLOYEE') as UserRole;

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
   * Get active departments for public registration dropdown.
   */
  async getPublicDepartments() {
    return this.repo.findActiveDepartments();
  }

  /**
   * Approve a pending user account.
   */
  async approveAccount(id: string, data: ApprovalRequestDTO) {
    const user = await this.repo.findUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status !== AccountStatus.PENDING) {
      throw new AppError(`Cannot approve user with status '${user.status}'`, 400);
    }

    const role = (data.role || user.role) as UserRole;
    const updated = await this.repo.updateAccountStatus(id, AccountStatus.APPROVED, role);

    // Synchronize email verification status on approval
    await prisma.authUser.updateMany({
      where: { email: user.email },
      data: { emailVerified: true },
    }).catch((err) => console.error('[approveAccount] authUser update error:', err));

    await prisma.user.update({
      where: { id },
      data: { isEmailVerified: true },
    }).catch((err) => console.error('[approveAccount] user isEmailVerified update error:', err));

    // Send Welcome Email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const loginUrl = `${frontendUrl}/login`;
    const fullName = updated.employeeProfile
      ? `${updated.employeeProfile.firstName} ${updated.employeeProfile.lastName}`.trim()
      : updated.email;

    try {
      await sendWelcomeApprovedEmail({
        to: updated.email,
        name: fullName,
        employeeId: updated.employeeProfile?.employeeId || '',
        departmentName: updated.employeeProfile?.department?.name || '',
        role: updated.role,
        loginUrl,
      });
    } catch (emailErr) {
      console.error('[approveAccount] Error sending welcome email:', emailErr);
    }

    return {
      message: 'Account approved successfully',
      user: this.formatPendingUser(updated),
    };
  }


  /**
   * Reject a pending user account.
   */
  async rejectAccount(id: string, data: RejectionRequestDTO) {
    const user = await this.repo.findUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status !== AccountStatus.PENDING) {
      throw new AppError(`Cannot reject user with status '${user.status}'`, 400);
    }

    const updated = await this.repo.updateAccountStatus(id, AccountStatus.REJECTED);

    return {
      message: 'Account request rejected',
      reason: data.reason,
      user: this.formatPendingUser(updated),
    };
  }

  /**
   * Suspend user account (Future use placeholder).
   */
  async suspendAccount(id: string) {
    const user = await this.repo.findUserById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await this.repo.updateAccountStatus(id, AccountStatus.SUSPENDED);

    return {
      message: 'Account suspended successfully',
      user: this.formatPendingUser(updated),
    };
  }
}

export const identityService = new IdentityService();
