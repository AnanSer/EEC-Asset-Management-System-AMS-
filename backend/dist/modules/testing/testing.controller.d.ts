import { Request, Response } from 'express';
export declare class TestingController {
    private handleError;
    getInspectionsByTicket(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    createInspection(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateInspection(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const testingController: TestingController;
//# sourceMappingURL=testing.controller.d.ts.map