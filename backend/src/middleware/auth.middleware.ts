// EEC EAMS – Authentication Middleware (Phase 9A.1)
// Reusable authentication middleware powered by Better Auth session validation.

import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';
import '../types/auth';

/**
 * Validates Better Auth session from request headers.
 * Attaches authenticated user and session to `req.auth`.
 * Returns 401 Unauthorized if no valid session exists.
 */
async function handleRequireAuth(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData || !sessionData.user || !sessionData.session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
    }

    req.auth = {
      user: sessionData.user,
      session: sessionData.session,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session',
    });
  }
}

/**
 * Optionally validates Better Auth session from request headers.
 * Attaches authenticated user and session to `req.auth` if valid session exists.
 * Continues without error if user is not logged in.
 */
async function handleOptionalAuth(req: Request, _res: Response, next: NextFunction): Promise<any> {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionData && sessionData.user && sessionData.session) {
      req.auth = {
        user: sessionData.user,
        session: sessionData.session,
      };
    } else {
      req.auth = undefined;
    }

    return next();
  } catch (_error) {
    req.auth = undefined;
    return next();
  }
}

// Support both `requireAuth` and `requireAuth()`
export function requireAuth(req: Request, res: Response, next: NextFunction): Promise<any>;
export function requireAuth(): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export function requireAuth(req?: any, res?: any, next?: any): any {
  if (req && res && typeof next === 'function') {
    return handleRequireAuth(req, res, next);
  }
  return (reqInner: Request, resInner: Response, nextInner: NextFunction) =>
    handleRequireAuth(reqInner, resInner, nextInner);
}

// Support both `optionalAuth` and `optionalAuth()`
export function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<any>;
export function optionalAuth(): (req: Request, res: Response, next: NextFunction) => Promise<any>;
export function optionalAuth(req?: any, res?: any, next?: any): any {
  if (req && res && typeof next === 'function') {
    return handleOptionalAuth(req, res, next);
  }
  return (reqInner: Request, resInner: Response, nextInner: NextFunction) =>
    handleOptionalAuth(reqInner, resInner, nextInner);
}
