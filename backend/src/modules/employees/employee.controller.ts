import { Request, Response } from 'express';
import { employeeService, EmployeeService, AppError } from './employee.service';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  employeeQuerySchema,
} from './employee.validator';
import prisma from '../../lib/prisma';
import { ROLES, type Role } from '../../constants';
import { canAccessEmployee, AuthUserContext } from '../../lib/authorization';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  buildPagination,
} from '../../lib/api';

export class EmployeeController {
  constructor(private service: EmployeeService = employeeService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = employeeQuerySchema.parse(req.query);

      // Resolve authenticated user role and profile
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const role = user.role as Role;

          // DEPARTMENT_MANAGER: View employees only inside own department
          if (role === ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
            parsedQuery.departmentId = user.employeeProfile.departmentId;
          }

          // EMPLOYEE: View only own employee profile
          if (role === ROLES.EMPLOYEE) {
            if (user.employeeProfile) {
              const single = await this.service.getEmployeeById(user.employeeProfile.id);
              return res.status(200).json(
                paginatedResponse(single ? [single] : [], buildPagination(1, 10, single ? 1 : 0))
              );
            } else {
              return res.status(200).json(
                paginatedResponse([], buildPagination(1, 10, 0))
              );
            }
          }
        }
      }

      const { employees, meta } = await this.service.getEmployees(parsedQuery);
      const pagination = buildPagination(meta.page, meta.limit, meta.total);

      return res.status(200).json(
        paginatedResponse(employees, pagination)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const employee = await this.service.getEmployeeById(id);

      if (!employee) {
        return res.status(404).json(
          errorResponse('Employee not found')
        );
      }

      // Check ownership & department access
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const authContext: AuthUserContext = {
            userId: user.id,
            role: user.role as Role,
            departmentId: user.employeeProfile?.departmentId,
            employeeProfileId: user.employeeProfile?.id,
            employeeId: user.employeeProfile?.employeeId,
          };

          const allowed = canAccessEmployee(authContext, {
            id: employee.id,
            userId: employee.userId,
            employeeId: employee.employeeId,
            departmentId: employee.departmentId,
          });

          if (!allowed) {
            return res.status(403).json(
              errorResponse('Forbidden: You do not have permission to view this employee profile')
            );
          }
        }
      }

      return res.status(200).json(
        successResponse(employee)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createEmployeeSchema.parse(req.body);
      const newEmployee = await this.service.createEmployee(validatedData);

      return res.status(201).json(
        createdResponse(newEmployee, null, 'Employee created successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = updateEmployeeSchema.parse(req.body);
      const updated = await this.service.updateEmployee(id, validatedData);

      return res.status(200).json(
        successResponse(updated, null, 'Employee updated successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { isActive } = updateEmployeeStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(id, isActive);

      return res.status(200).json(
        successResponse(updated, null, `Employee ${isActive ? 'activated' : 'deactivated'} successfully`)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  private handleError(res: Response, err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json(
        errorResponse(err.message, err.statusCode, err.errors)
      );
    }

    if (err?.name === 'ZodError') {
      const formattedErrors = err.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(422).json(
        errorResponse('Validation failed', 422, formattedErrors)
      );
    }

    console.error('Unhandled Employee Error:', err);
    return res.status(500).json(
      errorResponse('Internal server error')
    );
  }
}

export const employeeController = new EmployeeController();
