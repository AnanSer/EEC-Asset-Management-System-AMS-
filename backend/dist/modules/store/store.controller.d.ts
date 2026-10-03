/**
 * Store Operations Controller — EEC EAMS (Phase 11E)
 */
import { Request, Response } from 'express';
export declare class StoreController {
    private getAuthContext;
    getDashboard: (req: Request, res: Response) => Promise<any>;
    getAssetMovementHistory: (req: Request, res: Response) => Promise<any>;
}
export declare const storeController: StoreController;
//# sourceMappingURL=store.controller.d.ts.map