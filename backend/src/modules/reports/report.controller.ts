import { Request, Response } from 'express';
import { reportService, ReportService } from './report.service';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  buildPagination,
} from '../../lib/api';

export class ReportController {
  constructor(private service: ReportService = reportService) {}

  getDashboard = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getDashboard();
      return res.status(200).json(successResponse(data));
    } catch (err: any) {
      console.error('Reports Dashboard Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve reports dashboard metrics', 'INTERNAL_ERROR')
      );
    }
  };

  getAssets = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getAssets(req.query);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json({
        ...paginatedResponse(result.data, pagination),
        summary: result.summary,
      });
    } catch (err: any) {
      console.error('Reports Assets Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve assets report', 'INTERNAL_ERROR')
      );
    }
  };

  getEmployees = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getEmployees(req.query);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json(paginatedResponse(result.data, pagination));
    } catch (err: any) {
      console.error('Reports Employees Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve employees report', 'INTERNAL_ERROR')
      );
    }
  };

  getDepartments = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getDepartments(req.query);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json(paginatedResponse(result.data, pagination));
    } catch (err: any) {
      console.error('Reports Departments Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve departments report', 'INTERNAL_ERROR')
      );
    }
  };

  getMaintenance = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getMaintenance(req.query);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json({
        ...paginatedResponse(result.data, pagination),
        summary: result.summary,
      });
    } catch (err: any) {
      console.error('Reports Maintenance Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve maintenance report', 'INTERNAL_ERROR')
      );
    }
  };

  getWarranty = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getWarranty(req.query);
      const pagination = buildPagination(result.meta.page, result.meta.limit, result.meta.total);
      return res.status(200).json({
        ...paginatedResponse(result.data, pagination),
        buckets: result.buckets,
      });
    } catch (err: any) {
      console.error('Reports Warranty Error:', err);
      return res.status(500).json(
        errorResponse('Failed to retrieve warranty report', 'INTERNAL_ERROR')
      );
    }
  };
}

export const reportController = new ReportController();
