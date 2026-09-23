"use strict";
// EEC EAMS – Authentication Middleware (Phase 9A.1)
// Reusable authentication middleware powered by Better Auth session validation.
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const node_1 = require("better-auth/node");
const auth_1 = require("../lib/auth");
require("../types/auth");
/**
 * Validates Better Auth session from request headers.
 * Attaches authenticated user and session to `req.auth`.
 * Returns 401 Unauthorized if no valid session exists.
 */
async function handleRequireAuth(req, res, next) {
    try {
        const sessionData = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
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
    }
    catch (error) {
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
async function handleOptionalAuth(req, _res, next) {
    try {
        const sessionData = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (sessionData && sessionData.user && sessionData.session) {
            req.auth = {
                user: sessionData.user,
                session: sessionData.session,
            };
        }
        else {
            req.auth = undefined;
        }
        return next();
    }
    catch (_error) {
        req.auth = undefined;
        return next();
    }
}
function requireAuth(req, res, next) {
    if (req && res && typeof next === 'function') {
        return handleRequireAuth(req, res, next);
    }
    return (reqInner, resInner, nextInner) => handleRequireAuth(reqInner, resInner, nextInner);
}
function optionalAuth(req, res, next) {
    if (req && res && typeof next === 'function') {
        return handleOptionalAuth(req, res, next);
    }
    return (reqInner, resInner, nextInner) => handleOptionalAuth(reqInner, resInner, nextInner);
}
//# sourceMappingURL=auth.middleware.js.map