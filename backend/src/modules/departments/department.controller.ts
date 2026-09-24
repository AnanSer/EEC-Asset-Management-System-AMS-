import { Request, Response } from 'express';
import { departmentService, DepartmentService, AppError } from './department.service';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  updateStatusSchema,
  departmentQuerySchema,
} from './department.validator';
import {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  buildPagination,
} from '../../lib/api';

export class DepartmentController {
  constructor(private service: DepartmentService = departmentService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = departmentQuerySchema.parse(req.query);
      const { departments, meta } = await this.service.getDepartments(parsedQuery);
      const pagination = buildPagination(meta.page, meta.limit, meta.total);

      return res.status(200).json(
        paginatedResponse(departments, pagination)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const department = await this.service.getDepartmentById(id);

      return res.status(200).json(
        successResponse(department)
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createDepartmentSchema.parse(req.body);
      const newDepartment = await this.service.createDepartment(validatedData);

      return res.status(201).json(
        createdResponse(newDepartment, null, 'Department created successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = updateDepartmentSchema.parse(req.body);
      const updated = await this.service.updateDepartment(id, validatedData);

      return res.status(200).json(
        successResponse(updated, null, 'Department updated successfully')
      );
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { isActive } = updateStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(id, isActive);

      return res.status(200).json(
        successResponse(updated, null, `Department ${isActive ? 'activated' : 'deactivated'} successfully`)
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

    console.error('Unhandled Department Error:', err);
    return res.status(500).json(
      errorResponse('Internal server error')
    );
  }
}

export const departmentController = new DepartmentController();
