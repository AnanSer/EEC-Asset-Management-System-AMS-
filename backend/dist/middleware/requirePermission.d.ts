/**
 * EEC EAMS – Permission Authorization Middleware (Phase 9D.2)
 * Validates whether the authenticated user's role grants the requested permission.
 * Returns 401 if unauthenticated, 403 if permission is missing.
 */
import { Request, Response, NextFunction } from 'express';
import { type Permission } from '../constants';
export declare function requirePermission(permission: Permission): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export default requirePermission;
//# sourceMappingURL=requirePermission.d.ts.map