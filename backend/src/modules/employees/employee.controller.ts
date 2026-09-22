import { Request, Response } from 'express';
import { employeeService, EmployeeService, AppError } from './employee.service';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  employeeQuerySchema,
} from './employee.validator';

export class EmployeeController {
  constructor(private service: EmployeeService = employeeService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const parsedQuery = employeeQuerySchema.parse(req.query);
      const { employees, meta } = await this.service.getEmployees(parsedQuery);

      return res.status(200).json({
        success: true,
        data: employees,
        meta,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const employee = await this.service.getEmployeeById(id);

      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const validatedData = createEmployeeSchema.parse(req.body);
      const newEmployee = await this.service.createEmployee(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: newEmployee,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const validatedData = updateEmployeeSchema.parse(req.body);
      const updated = await this.service.updateEmployee(id, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: updated,
      });
    } catch (err: any) {
      return this.handleError(res, err);
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { isActive } = updateEmployeeStatusSchema.parse(req.body);
      const updated = await this.service.updateStatus(id, isActive);

      return res.status(200).json({
        success: true,
        message: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`,
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

    console.error('Unhandled Employee Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export const employeeController = new EmployeeController();
