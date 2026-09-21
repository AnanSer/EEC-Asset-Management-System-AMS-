import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
export declare class DepartmentController {
    private service;
    constructor(service?: DepartmentService);
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const departmentController: DepartmentController;
//# sourceMappingURL=department.controller.d.ts.map