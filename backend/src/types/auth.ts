// EEC EAMS – Shared Authentication Types (Phase 9A.1)
// Types for authenticated user, session, and Express request extension.

import type { auth } from '../lib/auth';
import type { Request } from 'express';

// Infer types directly from Better Auth instance
export type AuthSessionData = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;

export interface AuthContext {
  user: AuthUser;
  session: AuthSession;
}

// Global declaration to augment Express.Request with `auth`
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

// Strictly-typed request interface when requireAuth is used
export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}

// Request interface when optionalAuth is used
export interface OptionalAuthRequest extends Request {
  auth?: AuthContext;
}
