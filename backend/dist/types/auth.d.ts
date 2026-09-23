import type { auth } from '../lib/auth';
import type { Request } from 'express';
export type AuthSessionData = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
export interface AuthContext {
    user: AuthUser;
    session: AuthSession;
}
declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
export interface AuthenticatedRequest extends Request {
    auth: AuthContext;
}
export interface OptionalAuthRequest extends Request {
    auth?: AuthContext;
}
//# sourceMappingURL=auth.d.ts.map