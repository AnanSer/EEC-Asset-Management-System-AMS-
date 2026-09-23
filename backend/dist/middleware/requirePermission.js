"use strict";
/**
 * EEC EAMS – Permission Authorization Middleware (Phase 9D.2)
 * Validates whether the authenticated user's role grants the requested permission.
 * Returns 401 if unauthenticated, 403 if permission is missing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
const constants_1 = require("../constants");
const prisma_1 = require("../lib/prisma");
function requirePermission(permission) {
    return async (req, res, next) => {
        if (!req.auth || !req.auth.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Authentication required',
            });
        }
        try {
            const user = await prisma_1.prisma.user.findFirst({
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
            const userRole = user.role;
            const allowedPermissions = constants_1.ROLE_PERMISSIONS[userRole] || [];
            if (!allowedPermissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden: Role [${userRole}] lacks permission [${permission}]`,
                });
            }
            return next();
        }
        catch (error) {
            console.error('requirePermission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during permission verification',
            });
        }
    };
}
exports.default = requirePermission;
//# sourceMappingURL=requirePermission.js.map