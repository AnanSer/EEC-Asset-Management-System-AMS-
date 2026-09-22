import { Request, Response } from 'express';
import { assignmentService, AssignmentService, AppError } from './assignment.service';
import {
  assignAssetSchema,
  transferAssetSchema,
  returnAssetSchema,
  assignmentQuerySchema,
} from './assignment.validator';

export class AssignmentController {
  constructor(private service: AssignmentService = assignmentService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = assignmentQuerySchema.parse(req.query);
      const { assignments, meta } = await this.service.getAssignments(parsedQuery);

      return res.status(200).json({
        success: true,
        data: assignments,
        meta,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const assignment = await this.service.getAssignmentById(id);

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);
      const history = await this.service.getAssetHistory(assetId);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  assign = async (req: Request, res: Response) => {
    try {
      const validatedData = assignAssetSchema.parse(req.body);
      const newAssignment = await this.service.assignAsset(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Asset assigned successfully',
        data: newAssignment,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  transfer = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);
      const validatedData = transferAssetSchema.parse(req.body);
      const updatedAssignment = await this.service.transferAsset(assetId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Asset transferred successfully',
        data: updatedAssignment,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  returnAsset = async (req: Request, res: Response) => {
    try {
      const assetId = String(req.params.assetId);
      const validatedData = returnAssetSchema.parse(req.body);
      const closedAssignment = await this.service.returnAsset(assetId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Asset returned successfully',
        data: closedAssignment,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getStats = async (_req: Request, res: Response) => {
    try {
      const stats = await this.service.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats,
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

    console.error('Unhandled Assignment Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const assignmentController = new AssignmentController();
