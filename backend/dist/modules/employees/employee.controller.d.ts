import { Request, Response } from 'express';
import { EmployeeService } from './employee.service';
export declare class EmployeeController {
    private service;
    constructor(service?: EmployeeService);
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const employeeController: EmployeeController;
//# sourceMappingURL=employee.controller.d.ts.map