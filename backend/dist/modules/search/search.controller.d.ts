import { Request, Response } from 'express';
import { SearchService } from './search.service';
export declare class SearchController {
    private service;
    constructor(service?: SearchService);
    search: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
export declare const searchController: SearchController;
//# sourceMappingURL=search.controller.d.ts.map