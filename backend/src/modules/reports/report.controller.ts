import { Request, Response } from 'express';
import { reportService, ReportService } from './report.service';

export class ReportController {
  constructor(private service: ReportService = reportService) {}

  getDashboard = async (_req: Request, res: Response) => {
    try {
      const data = await this.service.getDashboard();
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      console.error('Reports Dashboard Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve reports dashboard metrics',
      });
    }
  };

  getAssets = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getAssets(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        summary: result.summary,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error('Reports Assets Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve assets report',
      });
    }
  };

  getEmployees = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getEmployees(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error('Reports Employees Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve employees report',
      });
    }
  };

  getDepartments = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getDepartments(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error('Reports Departments Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve departments report',
      });
    }
  };

  getMaintenance = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getMaintenance(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        summary: result.summary,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error('Reports Maintenance Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve maintenance report',
      });
    }
  };

  getWarranty = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getWarranty(req.query);
      return res.status(200).json({
        success: true,
        data: result.data,
        buckets: result.buckets,
        meta: result.meta,
      });
    } catch (err: any) {
      console.error('Reports Warranty Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve warranty report',
      });
    }
  };
}

export const reportController = new ReportController();
