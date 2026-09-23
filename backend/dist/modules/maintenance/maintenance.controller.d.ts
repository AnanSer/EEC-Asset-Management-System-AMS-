import { Request, Response } from 'express';
export declare class MaintenanceController {
    private handleError;
    getTickets(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTechnicians(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getTicketById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createTicket(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateTicket(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getDashboardStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const maintenanceController: MaintenanceController;
//# sourceMappingURL=maintenance.controller.d.ts.map