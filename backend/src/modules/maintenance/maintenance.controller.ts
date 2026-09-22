import { Request, Response } from 'express';
import { maintenanceService, AppError } from './maintenance.service';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  updateMaintenanceStatusSchema,
  maintenanceQuerySchema,
} from './maintenance.validator';
import { ZodError } from 'zod';

export class MaintenanceController {
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

  async getTickets(req: Request, res: Response) {
    try {
      const validatedQuery = maintenanceQuerySchema.parse(req.query);
      const result = await maintenanceService.getTickets(validatedQuery);
      return res.status(200).json({
        success: true,
        data: result.tickets,
        meta: result.meta,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getTicketById(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const ticket = await maintenanceService.getTicketById(id);
      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createTicket(req: Request, res: Response) {
    try {
      const validatedData = createMaintenanceSchema.parse(req.body);
      const ticket = await maintenanceService.createTicket(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Maintenance ticket created successfully',
        data: ticket,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateTicket(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateMaintenanceSchema.parse(req.body);
      const ticket = await maintenanceService.updateTicket(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Maintenance ticket updated successfully',
        data: ticket,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const validatedData = updateMaintenanceStatusSchema.parse(req.body);
      const ticket = await maintenanceService.updateStatus(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Maintenance ticket status updated successfully',
        data: ticket,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await maintenanceService.getDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

export const maintenanceController = new MaintenanceController();
