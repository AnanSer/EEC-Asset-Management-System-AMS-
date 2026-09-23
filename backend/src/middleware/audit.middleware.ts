/**
 * EEC EAMS – Audit Middleware (Phase 9D.2 Placeholder)
 * Placeholder middleware for future audit logging of security and mutation events.
 */

import { Request, Response, NextFunction } from 'express';

export function auditMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  return next();
}

export default auditMiddleware;
