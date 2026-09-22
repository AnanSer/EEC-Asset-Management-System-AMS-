import { Request, Response } from 'express';
import { testingService, AppError } from './testing.service';
import { createInspectionSchema, updateInspectionSchema } from './testing.validator';
import { ZodError } from 'zod';

export class TestingController {
  private handleError(res: Response, error: unknown) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors,
      });
    }

    const err = error as Error;
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }

  async getInspectionsByTicket(req: Request, res: Response) {
    try {
      const ticketId = String(req.params.ticketId);
      const inspections = await testingService.getInspectionsByTicket(ticketId);
      return res.status(200).json({
        success: true,
        data: inspections,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createInspection(req: Request, res: Response) {
    try {
      const validatedData = createInspectionSchema.parse(req.body);
      const inspection = await testingService.createInspection(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Inspection test recorded successfully',
        data: inspection,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateInspection(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateInspectionSchema.parse(req.body);
      const inspection = await testingService.updateInspection(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Inspection test updated successfully',
        data: inspection,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

export const testingController = new TestingController();
