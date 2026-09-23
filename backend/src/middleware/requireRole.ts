/**
 * EEC EAMS – Role Authorization Middleware (Phase 9D.2)
 * Ensures authenticated users possess at least one of the specified roles.
 * Returns 401 if unauthenticated, 403 if forbidden.
 */

import { Request, Response, NextFunction } from 'express';
import { type Role, ROLES } from '../constants';
import { prisma } from '../lib/prisma';

export function requireRole(...allowedRoles: (Role | Role[])[]) {
  const flattenedRoles: Role[] = allowedRoles.flat();

  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (!req.auth || !req.auth.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
    }

    try {
      // Query database for latest user role and status
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: req.auth.user.id },
            { email: req.auth.user.email },
          ],
        },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: User record not found',
        });
      }

      if (user.status !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Account is ${user.status.toLowerCase()}`,
        });
      }

      const userRole = user.role as Role;

      if (!flattenedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access requires one of the following roles: [${flattenedRoles.join(', ')}]`,
        });
      }

      return next();
    } catch (error) {
      console.error('requireRole middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization check',
      });
    }
  };
}

export default requireRole;
