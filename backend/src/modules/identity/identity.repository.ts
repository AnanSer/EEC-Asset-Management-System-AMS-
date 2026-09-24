// EEC EAMS – Identity Module Repository (Phase 9A.2)
// Data access layer for User account lifecycle operations.

import prisma from '../../lib/prisma';
import { AccountStatus, UserRole } from '@prisma/client';

export class IdentityRepository {
  /**
   * Find pending user accounts with optional search, department filter, and pagination.
   */
  async findPendingUsers(params: {
    skip: number;
    take: number;
    search?: string;
    departmentId?: string;
  }) {
    const { skip, take, search, departmentId } = params;

    const where: any = {
      status: AccountStatus.PENDING,
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

    return prisma.user.findMany({
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
  async countPendingUsers(params: { search?: string; departmentId?: string }) {
    const { search, departmentId } = params;

    const where: any = {
      status: AccountStatus.PENDING,
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

    return prisma.user.count({ where });
  }

  /**
   * Find user by unique ID with profile and department.
   */
  async findUserById(id: string) {
    return prisma.user.findUnique({
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
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find employee profile by employeeId.
   */
  async findProfileByEmployeeId(employeeId: string) {
    return prisma.employeeProfile.findUnique({
      where: { employeeId },
    });
  }

  /**
   * Create a pending user with employee profile in a transaction.
   */
  async createRegistrationRequest(data: {
    email: string;
    passwordHash: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    employeeId: string;
    departmentId: string;
    jobTitle: string;
    phone?: string | null;
    officeLocation?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          status: AccountStatus.PENDING,
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
  async updateAccountStatus(
    id: string,
    status: AccountStatus,
    role?: UserRole,
  ) {
    return prisma.$transaction(async (tx) => {
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
            isActive: status === AccountStatus.APPROVED,
          },
        });
      }

      return user;
    });
  }

  /**
   * Find active departments for public registration dropdown.
   * Only id, name, and code are exposed.
   */
  async findActiveDepartments() {
    return prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const identityRepository = new IdentityRepository();

