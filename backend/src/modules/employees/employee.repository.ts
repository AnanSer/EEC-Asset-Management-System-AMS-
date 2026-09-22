import prisma from '../../lib/prisma';
import { CreateEmployeeDTO, UpdateEmployeeDTO } from './employee.validator';
import { AccountStatus, UserRole } from '@prisma/client';

export class EmployeeRepository {
  async findMany(params: {
    search?: string;
    departmentId?: string;
    role?: string;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { search, departmentId, role, isActive, skip, take } = params;

    const where: any = {};

    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }

    if (role && role !== 'all') {
      where.user = {
        ...where.user,
        role: role as UserRole,
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
      prisma.employeeProfile.findMany({
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
              assetAssignments: {
                where: { isCurrent: true },
              },
            },
          },
        },
      }),
      prisma.employeeProfile.count({ where }),
    ]);

    return { employees, total };
  }

  async findById(id: string) {
    return prisma.employeeProfile.findUnique({
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
            assetAssignments: {
              where: { isCurrent: true },
            },
          },
        },
      },
    });
  }

  async findByEmployeeId(employeeId: string) {
    return prisma.employeeProfile.findUnique({
      where: { employeeId },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createWithTransaction(data: CreateEmployeeDTO) {
    // Split full name into first and last name
    const nameParts = data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '-';

    return prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          role: data.role as UserRole,
          status: AccountStatus.PENDING,
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

  async updateWithTransaction(id: string, currentProfile: any, data: UpdateEmployeeDTO) {
    let firstName: string | undefined = undefined;
    let lastName: string | undefined = undefined;

    if (data.fullName !== undefined) {
      const nameParts = data.fullName.trim().split(/\s+/);
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '-';
    }

    return prisma.$transaction(async (tx) => {
      // Update User if email or role changed
      if (data.email !== undefined || data.role !== undefined) {
        await tx.user.update({
          where: { id: currentProfile.userId },
          data: {
            ...(data.email !== undefined && { email: data.email }),
            ...(data.role !== undefined && { role: data.role as UserRole }),
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

  async updateStatus(id: string, isActive: boolean) {
    return prisma.employeeProfile.update({
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

export const employeeRepository = new EmployeeRepository();
