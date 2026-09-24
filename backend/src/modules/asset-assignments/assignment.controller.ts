import { Request, Response } from 'express';
import { assignmentService, AssignmentService, AppError } from './assignment.service';
import {
  assignAssetSchema,
  transferAssetSchema,
  returnAssetSchema,
  assignmentQuerySchema,
} from './assignment.validator';
import prisma from '../../lib/prisma';
import { ROLES, type Role } from '../../constants';
import { canAccessAsset, AuthUserContext } from '../../lib/authorization';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  buildPagination,
} from '../../lib/api';

export class AssignmentController {
  constructor(private service: AssignmentService = assignmentService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = assignmentQuerySchema.parse(req.query);

      // Scoped access based on authenticated user role
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const role = user.role as Role;

          // DEPARTMENT_MANAGER: View assignments belonging to own department
          if (role === ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
            parsedQuery.departmentId = user.employeeProfile.departmentId;
          }

          // EMPLOYEE: View assignment history for own assigned assets only
          if (role === ROLES.EMPLOYEE) {
            if (user.employeeProfile) {
              parsedQuery.employeeId = user.employeeProfile.id;
            } else {
              return res.status(200).json(
                paginatedResponse([], buildPagination(1, 10, 0))
              );
            }
          }
        }
      }

      const { assignments, meta } = await this.service.getAssignments(parsedQuery);
      const pagination = buildPagination(meta.page, meta.limit, meta.total);

      return res.status(200).json(
        paginatedResponse(assignments, pagination)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const assignment = await this.service.getAssignmentById(id);

      if (!assignment) {
        return res.status(404).json(
          errorResponse('Assignment not found')
        );
      }

      return res.status(200).json(
        successResponse(assignment)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);

      // Check whether user can access this asset's history
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const asset = await prisma.asset.findUnique({
            where: { id: assetId },
            include: { assignments: { where: { isCurrent: true } } },
          });

          if (!asset) {
            return res.status(404).json(
              errorResponse('Asset not found')
            );
          }

          const authContext: AuthUserContext = {
            userId: user.id,
            role: user.role as Role,
            departmentId: user.employeeProfile?.departmentId,
            employeeProfileId: user.employeeProfile?.id,
            employeeId: user.employeeProfile?.employeeId,
          };

          const allowed = canAccessAsset(authContext, {
            id: asset.id,
            departmentId: asset.departmentId,
            assignments: asset.assignments,
          });

          if (!allowed) {
            return res.status(403).json(
              errorResponse('Forbidden: You do not have permission to view assignment history for this asset')
            );
          }
        }
      }

      const history = await this.service.getAssetHistory(assetId);

      return res.status(200).json(
        successResponse(history)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  assign = async (req: Request, res: Response) => {
    try {
      const validatedData = assignAssetSchema.parse(req.body);
      const newAssignment = await this.service.assignAsset(validatedData);

      return res.status(201).json(
        createdResponse(newAssignment, null, 'Asset assigned successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  transfer = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);
      const validatedData = transferAssetSchema.parse(req.body);
      const updatedAssignment = await this.service.transferAsset(assetId, validatedData);

      return res.status(200).json(
        successResponse(updatedAssignment, null, 'Asset transferred successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  returnAsset = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);
      const validatedData = returnAssetSchema.parse(req.body);
      const closedAssignment = await this.service.returnAsset(assetId, validatedData);

      return res.status(200).json(
        successResponse(closedAssignment, null, 'Asset returned successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.service.getDashboardStats();
      return res.status(200).json(
        successResponse(stats)
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

    console.error('Unhandled Assignment Error:', err);
    return res.status(500).json(
      errorResponse('Internal server error')
    );
  }
}

export const assignmentController = new AssignmentController();
