import { Request, Response } from 'express';
export declare class ReturnController {
    private getAuthContext;
    /**
     * POST /api/returns - Create a return request
     */
    create(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/returns/:id/receive - Store Keeper receives physical asset for a request
     */
    receive(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/returns/walk-in - Store Keeper directly receives asset without request
     */
    receiveWalkIn(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/returns/:id/cancel - Cancel pending return request
     */
    cancel(req: Request, res: Response): Promise<any>;
    /**
     * GET /api/returns - List return requests
     */
    getAll(req: Request, res: Response): Promise<any>;
    /**
     * GET /api/returns/:id - Get single return request
     */
    getById(req: Request, res: Response): Promise<any>;
}
export declare const returnController: ReturnController;
//# sourceMappingURL=return.controller.d.ts.map