import { Request, Response } from 'express';
import { AssetService } from './asset.service';
export declare class AssetController {
    private service;
    constructor(service?: AssetService);
    getAll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    update: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    private handleError;
}
export declare const assetController: AssetController;
//# sourceMappingURL=asset.controller.d.ts.map