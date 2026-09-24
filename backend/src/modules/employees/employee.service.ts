import prisma from '../../lib/prisma';
import { employeeRepository, EmployeeRepository } from './employee.repository';
import { CreateEmployeeDTO, UpdateEmployeeDTO, EmployeeQueryDTO } from './employee.validator';
import { randomBytes } from 'crypto';
import { sendWelcomeInvitationEmail } from '../../lib/email';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class EmployeeService {
  constructor(private repo: EmployeeRepository = employeeRepository) {}

  private formatEmployee(profile: any) {
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.userId,
      employeeId: profile.employeeId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      email: profile.user?.email,
      phone: profile.phone,
      position: profile.jobTitle,
      jobTitle: profile.jobTitle,
      departmentId: profile.departmentId,
      department: profile.department,
      officeLocation: profile.officeLocation || profile.department?.officeLocation || null,
      role: profile.user?.role,
      accountStatus: profile.user?.status,
      isActive: Boolean(profile.isActive),
      isEmailVerified: Boolean(profile.user?.isEmailVerified),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      _count: profile._count,
    };
  }

  async getEmployees(query: EmployeeQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    let isActive: boolean | undefined = undefined;
    if (query.status === 'active') isActive = true;
    if (query.status === 'inactive') isActive = false;

    const { employees, total } = await this.repo.findMany({
      search: query.search,
      departmentId: query.departmentId,
      role: query.role,
      isActive,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      employees: employees.map((e) => this.formatEmployee(e)),
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

  async getEmployeeById(id: string) {
    const employee = await this.repo.findById(id);
    if (!employee) {
      throw new AppError(`Employee with ID '${id}' not found`, 404);
    }
    return this.formatEmployee(employee);
  }

  async createEmployee(data: CreateEmployeeDTO) {
    // 1. Verify unique Employee ID
    const existingEmployeeId = await this.repo.findByEmployeeId(data.employeeId);
    if (existingEmployeeId) {
      throw new AppError(`Employee ID '${data.employeeId}' is already in use`, 409);
    }

    // 2. Verify unique Email in business user
    const existingEmail = await this.repo.findUserByEmail(data.email);
    if (existingEmail) {
      throw new AppError(`Email address '${data.email}' is already registered`, 409);
    }

    // 3. Verify unique Email in Better Auth
    const existingAuthUser = await prisma.authUser.findUnique({
      where: { email: data.email },
    });
    if (existingAuthUser) {
      throw new AppError(`Email address '${data.email}' is already registered in authentication system`, 409);
    }

    // 4. Verify Department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!department) {
      throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
    }

    // 5. Generate password setup token using existing Password Reset mechanism
    const resetToken = randomBytes(24).toString('base64url');

    // 6. Create employee with APPROVED status and auth verification token
    const created = await this.repo.createAdminRegisteredEmployee({
      data,
      resetToken,
    });

    // 7. Dispatch Welcome Invitation Email with Create Your Password link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      const emailResult = await sendWelcomeInvitationEmail({
        to: data.email,
        name: data.fullName,
        employeeId: data.employeeId,
        departmentName: department.name,
        role: data.role,
        resetUrl,
        token: resetToken,
      });

      if (!emailResult?.success) {
        console.error('[createEmployee] SMTP error sending welcome invitation email:', emailResult?.error);
      }
    } catch (emailErr: any) {
      console.error('[createEmployee] SMTP error sending welcome invitation email:', emailErr?.message || emailErr);
    }

    return this.formatEmployee(created);
  }


  async updateEmployee(id: string, data: UpdateEmployeeDTO) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(`Employee with ID '${id}' not found`, 404);
    }

    // Check Employee ID uniqueness if changed
    if (data.employeeId && data.employeeId !== current.employeeId) {
      const taken = await this.repo.findByEmployeeId(data.employeeId);
      if (taken) {
        throw new AppError(`Employee ID '${data.employeeId}' is already in use`, 409);
      }
    }

    // Check Email uniqueness if changed
    if (data.email && data.email !== current.user?.email) {
      const takenEmail = await this.repo.findUserByEmail(data.email);
      if (takenEmail) {
        throw new AppError(`Email address '${data.email}' is already registered`, 409);
      }
    }

    // Check Department exists if changed
    if (data.departmentId && data.departmentId !== current.departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!dept) {
        throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
      }
    }

    const updated = await this.repo.updateWithTransaction(id, current, data);
    return this.formatEmployee(updated);
  }

  async updateStatus(id: string, isActive: boolean) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(`Employee with ID '${id}' not found`, 404);
    }

    const updated = await this.repo.updateStatus(id, isActive);
    return this.formatEmployee(updated);
  }
}

export const employeeService = new EmployeeService();
