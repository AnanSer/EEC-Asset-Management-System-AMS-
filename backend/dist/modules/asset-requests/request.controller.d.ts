import { Request, Response } from 'express';
export declare class RequestController {
    /**
     * Helper to extract business role and user id from auth session
     */
    private getAuthContext;
    /**
     * POST /api/requests - Create a new asset request
     */
    create(req: Request, res: Response): Promise<any>;
    /**
     * GET /api/requests - List requests with filtering and pagination
     */
    getAll(req: Request, res: Response): Promise<any>;
    /**
     * GET /api/requests/:id - Retrieve single request
     */
    getById(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/requests/:id/approve - Approve asset request (ADMIN only)
     */
    approve(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/requests/:id/reject - Reject asset request (ADMIN only)
     */
    reject(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/requests/:id/fulfill - Fulfill asset request with physical handover (STORE_KEEPER / ADMIN)
     */
    fulfill(req: Request, res: Response): Promise<any>;
    /**
     * POST /api/requests/:id/cancel - Cancel pending request
     */
    cancel(req: Request, res: Response): Promise<any>;
}
export declare const requestController: RequestController;
//# sourceMappingURL=request.controller.d.ts.map