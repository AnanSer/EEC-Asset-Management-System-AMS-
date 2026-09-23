/**
 * EEC EAMS – Role Authorization Middleware (Phase 9D.2)
 * Ensures authenticated users possess at least one of the specified roles.
 * Returns 401 if unauthenticated, 403 if forbidden.
 */
import { Request, Response, NextFunction } from 'express';
import { type Role } from '../constants';
export declare function requireRole(...allowedRoles: (Role | Role[])[]): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export default requireRole;
//# sourceMappingURL=requireRole.d.ts.map