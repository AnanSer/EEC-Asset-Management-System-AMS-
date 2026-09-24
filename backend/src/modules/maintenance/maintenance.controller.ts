import { Request, Response } from 'express';
import { maintenanceService, AppError } from './maintenance.service';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  updateMaintenanceStatusSchema,
  maintenanceQuerySchema,
} from './maintenance.validator';
import { ZodError } from 'zod';
import prisma from '../../lib/prisma';
import { ROLES, type Role } from '../../constants';
import { canAccessMaintenanceTicket, AuthUserContext } from '../../lib/authorization';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  buildPagination,
} from '../../lib/api';

export class MaintenanceController {
  private handleError(res: Response, error: unknown) {
    if (error instanceof ZodError) {
      return res.status(400).json(
        errorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        )
      );
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(
        errorResponse(error.message, 'APP_ERROR', error.errors)
      );
    }

    const err = error as Error;
    return res.status(500).json(
      errorResponse(err.message || 'Internal server error', 'INTERNAL_ERROR')
    );
  }

  async getTickets(req: Request, res: Response) {
    try {
      const validatedQuery = maintenanceQuerySchema.parse(req.query);

      // Scoped access based on authenticated user role
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const role = user.role as Role;
          const isPersonal = validatedQuery.personal === 'true' || validatedQuery.personal === true || role === ROLES.EMPLOYEE;

          // Personal view: View tickets assigned to technician (IT_TECHNICIAN) OR reported by/assigned to user (EMPLOYEE, MANAGER)
          if (isPersonal) {
            if (user.employeeProfile) {
              const personalConditions: any[] = [];

              if (role === ROLES.IT_TECHNICIAN) {
                // IT Technician personal view: tickets assigned to this technician
                personalConditions.push(
                  { assignedTechnician: user.id },
                  { assignedTechnician: user.employeeProfile.employeeId },
                  { assignedTechnician: user.employeeProfile.id },
                  {
                    AND: [
                      { assignedTechnician: { contains: user.employeeProfile.firstName, mode: 'insensitive' as const } },
                      { assignedTechnician: { contains: user.employeeProfile.lastName, mode: 'insensitive' as const } },
                    ],
                  },
                  { assignedTechnician: { contains: user.employeeProfile.firstName, mode: 'insensitive' as const } }
                );
              } else {
                // Employee & Department Manager personal view: reported by user OR assigned asset
                personalConditions.push(
                  { reportedBy: user.id },
                  { reportedBy: user.employeeProfile.employeeId },
                  { reportedBy: user.employeeProfile.id },
                  { reportedBy: { contains: user.employeeProfile.firstName, mode: 'insensitive' as const } },
                  { reportedBy: { contains: user.employeeProfile.lastName, mode: 'insensitive' as const } },
                  {
                    asset: {
                      assignments: {
                        some: {
                          employeeId: user.employeeProfile.id,
                          isCurrent: true,
                        },
                      },
                    },
                  }
                );
              }

              const whereClause: any = {
                OR: personalConditions,
              };
              if (validatedQuery.status) {
                whereClause.status = validatedQuery.status;
              }

              const tickets = await prisma.maintenanceTicket.findMany({
                where: whereClause,
                include: {
                  asset: {
                    include: {
                      department: { select: { id: true, code: true, name: true } },
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
              });

              const pagination = buildPagination(1, 10, tickets.length);
              return res.status(200).json(paginatedResponse(tickets, pagination));
            } else {
              const pagination = buildPagination(1, 10, 0);
              return res.status(200).json(paginatedResponse([], pagination));
            }
          }

          // DEPARTMENT_MANAGER: View maintenance tickets belonging to own department only
          if (role === ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
            const deptTickets = await prisma.maintenanceTicket.findMany({
              where: {
                asset: {
                  departmentId: user.employeeProfile.departmentId,
                },
              },
              include: {
                asset: {
                  include: {
                    department: { select: { id: true, code: true, name: true } },
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            });

            const pagination = buildPagination(1, 10, deptTickets.length);
            return res.status(200).json(paginatedResponse(deptTickets, pagination));
          }
        }
      }

      const result = await maintenanceService.getTickets(validatedQuery);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json(paginatedResponse(result.tickets, pagination));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getTechnicians(req: Request, res: Response) {
    try {
      const techUsers = await prisma.user.findMany({
        where: {
          role: ROLES.IT_TECHNICIAN,
          status: 'APPROVED',
          employeeProfile: {
            isActive: true,
          },
        },
        include: {
          employeeProfile: {
            include: {
              department: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      const technicians = techUsers
        .filter((u) => u.employeeProfile !== null)
        .map((u) => {
          const ep = u.employeeProfile!;
          return {
            id: ep.id,
            employeeId: ep.employeeId,
            firstName: ep.firstName,
            lastName: ep.lastName,
            fullName: `${ep.firstName} ${ep.lastName}`.trim(),
            department: ep.department ? { id: ep.department.id, name: ep.department.name, code: ep.department.code } : null,
            user: { id: u.id, email: u.email, role: u.role },
          };
        });

      return res.status(200).json(successResponse(technicians));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getTicketById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const ticket = await maintenanceService.getTicketById(id);

      if (!ticket) {
        return res.status(404).json(
          errorResponse('Maintenance ticket not found', 'NOT_FOUND')
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
            name: user.employeeProfile
              ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`.trim()
              : null,
          };

          const allowed = canAccessMaintenanceTicket(authContext, ticket);

          if (!allowed) {
            return res.status(403).json(
              errorResponse('Forbidden: You do not have permission to view this maintenance ticket', 'FORBIDDEN')
            );
          }
        }
      }

      return res.status(200).json(successResponse(ticket));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createTicket(req: Request, res: Response) {
    try {
      const validatedData = createMaintenanceSchema.parse(req.body);

      // EMPLOYEE: Create maintenance ticket only for their assigned assets
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user && (user.role as Role) === ROLES.EMPLOYEE) {
          if (!user.employeeProfile) {
            return res.status(403).json(
              errorResponse('Forbidden: No employee profile associated with this account', 'FORBIDDEN')
            );
          }

          const isAssigned = await prisma.assetAssignment.findFirst({
            where: {
              assetId: validatedData.assetId,
              employeeId: user.employeeProfile.id,
              isCurrent: true,
            },
          });

          if (!isAssigned) {
            return res.status(403).json(
              errorResponse('Forbidden: Employees can only report maintenance tickets for assets currently assigned to them', 'FORBIDDEN')
            );
          }

          // Ensure reportedBy is set to employee name/id
          if (!validatedData.reportedBy) {
            validatedData.reportedBy = user.employeeProfile.employeeId;
          }
        }
      }

      const ticket = await maintenanceService.createTicket(validatedData);
      return res.status(201).json(
        createdResponse(ticket, undefined, 'Maintenance ticket created successfully')
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateMaintenanceSchema.parse(req.body);
      const ticket = await maintenanceService.updateTicket(id, validatedData);
      return res.status(200).json(
        successResponse(ticket, undefined, 'Maintenance ticket updated successfully')
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateMaintenanceStatusSchema.parse(req.body);
      const ticket = await maintenanceService.updateStatus(id, validatedData);
      return res.status(200).json(
        successResponse(ticket, undefined, 'Maintenance ticket status updated successfully')
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await maintenanceService.getDashboardStats();
      return res.status(200).json(successResponse(stats));
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
