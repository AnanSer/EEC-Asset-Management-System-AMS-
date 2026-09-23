import { Request, Response } from 'express';
import { ReportService } from './report.service';
export declare class ReportController {
    private service;
    constructor(service?: ReportService);
    getDashboard: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAssets: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getEmployees: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getDepartments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getMaintenance: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getWarranty: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map