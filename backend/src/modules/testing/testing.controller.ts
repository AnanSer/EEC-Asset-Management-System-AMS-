import { Request, Response } from 'express';
import { testingService, AppError } from './testing.service';
import { createInspectionSchema, updateInspectionSchema } from './testing.validator';
import { ZodError } from 'zod';
import {
  successResponse,
  createdResponse,
  errorResponse,
} from '../../lib/api';

export class TestingController {
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

  async getInspectionsByTicket(req: Request, res: Response) {
    try {
      const ticketId = String(req.params.ticketId);
      const inspections = await testingService.getInspectionsByTicket(ticketId);
      return res.status(200).json(successResponse(inspections));
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createInspection(req: Request, res: Response) {
    try {
      const validatedData = createInspectionSchema.parse(req.body);
      const inspection = await testingService.createInspection(validatedData);
      return res.status(201).json(
        createdResponse(inspection, undefined, 'Inspection test recorded successfully')
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateInspection(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateInspectionSchema.parse(req.body);
      const inspection = await testingService.updateInspection(id, validatedData);
      return res.status(200).json(
        successResponse(inspection, undefined, 'Inspection test updated successfully')
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

export const testingController = new TestingController();

