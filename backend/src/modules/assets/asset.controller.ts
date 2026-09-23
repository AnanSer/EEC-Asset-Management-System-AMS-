import { Request, Response } from 'express';
import { assetService, AssetService, AppError } from './asset.service';
import {
  createAssetSchema,
  updateAssetSchema,
  updateAssetStatusSchema,
  assetQuerySchema,
} from './asset.validator';
import prisma from '../../lib/prisma';
import { ROLES, type Role } from '../../constants';
import { canAccessAsset, AuthUserContext } from '../../lib/authorization';

export class AssetController {
  constructor(private service: AssetService = assetService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = assetQuerySchema.parse(req.query);

      // Scoped access based on authenticated user role
      if (req.auth?.user) {
        const user = await prisma.user.findFirst({
          where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
          include: { employeeProfile: true },
        });

        if (user) {
          const role = user.role as Role;

          // DEPARTMENT_MANAGER: View only assets inside own department
          if (role === ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
            parsedQuery.departmentId = user.employeeProfile.departmentId;
          }

          // EMPLOYEE: View only assets currently assigned to them
          if (role === ROLES.EMPLOYEE) {
            if (user.employeeProfile) {
              const activeAssignments = await prisma.assetAssignment.findMany({
                where: {
                  employeeId: user.employeeProfile.id,
                  isCurrent: true,
                },
                include: {
                  asset: {
                    include: {
                      department: { select: { id: true, code: true, name: true } },
                      assignments: {
                        where: { isCurrent: true },
                        include: {
                          employee: {
                            select: { id: true, employeeId: true, firstName: true, lastName: true },
                          },
                        },
                      },
                    },
                  },
                },
              });

              const userAssets = activeAssignments.map((a) => a.asset);
              return res.status(200).json({
                success: true,
                data: userAssets,
                meta: { total: userAssets.length, page: 1, limit: 10, totalPages: 1 },
              });
            } else {
              return res.status(200).json({
                success: true,
                data: [],
                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
              });
            }
          }
        }
      }

      const { assets, meta } = await this.service.getAssets(parsedQuery);

      return res.status(200).json({
        success: true,
        data: assets,
        meta,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const asset = await this.service.getAssetById(id);

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found',
        });
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

          const allowed = canAccessAsset(authContext, {
            id: asset.id,
            departmentId: asset.departmentId,
            currentAssignment: asset.currentAssignment,
          });

          if (!allowed) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: You do not have permission to view this asset',
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: asset,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createAssetSchema.parse(req.body);
      const newAsset = await this.service.createAsset(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Asset registered successfully',
        data: newAsset,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = updateAssetSchema.parse(req.body);
      const updated = await this.service.updateAsset(id, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Asset updated successfully',
        data: updated,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status } = updateAssetStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: `Asset status updated to '${status}'`,
        data: updated,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  private handleError(res: Response, err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
    }

    if (err?.name === 'ZodError') {
      const formattedErrors = err.issues?.map((issue: any) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    console.error('Unhandled Asset Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const assetController = new AssetController();
