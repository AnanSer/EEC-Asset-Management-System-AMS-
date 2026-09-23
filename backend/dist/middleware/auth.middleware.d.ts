import { Request, Response, NextFunction } from 'express';
import '../types/auth';
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<any>;
export declare function requireAuth(): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<any>;
export declare function optionalAuth(): (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=auth.middleware.d.ts.map