import { Request, Response } from 'express';
import { IdentityService } from './identity.service';
export declare class IdentityController {
    private service;
    constructor(service?: IdentityService);
    /**
     * POST /api/identity/register
     * Submit an employee registration request.
     */
    register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/identity/pending
     * List pending account requests awaiting approval.
     */
    getPending: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/identity/:id/approve
     * Approve a pending user account.
     */
    approve: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/identity/:id/reject
     * Reject a pending user account.
     */
    reject: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/identity/:id/suspend
     * Suspend a user account.
     */
    suspend: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const identityController: IdentityController;
//# sourceMappingURL=identity.controller.d.ts.map