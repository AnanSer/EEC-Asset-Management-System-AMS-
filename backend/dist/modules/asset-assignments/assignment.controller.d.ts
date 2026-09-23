import { Request, Response } from 'express';
import { AssignmentService } from './assignment.service';
export declare class AssignmentController {
    private service;
    constructor(service?: AssignmentService);
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    assign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    transfer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    returnAsset: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getStats: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const assignmentController: AssignmentController;
//# sourceMappingURL=assignment.controller.d.ts.map