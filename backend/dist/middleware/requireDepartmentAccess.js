"use strict";
/**
 * EEC EAMS – Department Access Authorization Middleware (Phase 9D.2)
 * Reusable middleware enforcing department boundaries:
 * - ADMIN: bypasses
 * - IT_TECHNICIAN: bypasses
 * - DEPARTMENT_MANAGER: can only access resources from their own department
 * - EMPLOYEE: can only access their own profile/resources
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDepartmentAccess = requireDepartmentAccess;
const constants_1 = require("../constants");
const prisma_1 = require("../lib/prisma");
function requireDepartmentAccess(options = {}) {
    const { departmentIdParam = 'departmentId', employeeIdParam = 'employeeId', } = options;
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
                include: {
                    employeeProfile: true,
                },
            });
            if (!user) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden: User profile not found',
                });
            }
            if (user.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: `Forbidden: Account is ${user.status.toLowerCase()}`,
                });
            }
            const role = user.role;
            // Rules 1 & 2: ADMIN and IT_TECHNICIAN bypass department restrictions
            if (role === constants_1.ROLES.ADMIN || role === constants_1.ROLES.IT_TECHNICIAN) {
                return next();
            }
            const userDeptId = user.employeeProfile?.departmentId;
            const userEmployeeId = user.employeeProfile?.employeeId;
            const userProfileId = user.employeeProfile?.id;
            // Extract target department ID from params, query, or body
            const targetDepartmentId = req.params[departmentIdParam] ||
                req.params.id ||
                req.query[departmentIdParam] ||
                req.body?.[departmentIdParam];
            // Extract target employee ID from params, query, or body
            const targetEmployeeId = req.params[employeeIdParam] ||
                req.params.id ||
                req.query[employeeIdParam] ||
                req.body?.[employeeIdParam];
            // Rule 3: DEPARTMENT_MANAGER can only access resources from their own department
            if (role === constants_1.ROLES.DEPARTMENT_MANAGER) {
                if (!userDeptId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Department manager is not assigned to a department',
                    });
                }
                if (targetDepartmentId && targetDepartmentId !== userDeptId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Cannot access resources outside your assigned department',
                    });
                }
                return next();
            }
            // Rule 4: EMPLOYEE can only access their own profile or assigned resources
            if (role === constants_1.ROLES.EMPLOYEE) {
                if (targetEmployeeId) {
                    const isSelf = targetEmployeeId === userEmployeeId ||
                        targetEmployeeId === userProfileId ||
                        targetEmployeeId === user.id;
                    if (!isSelf) {
                        return res.status(403).json({
                            success: false,
                            message: 'Forbidden: Employees can only access their own profile or assigned resources',
                        });
                    }
                }
                if (targetDepartmentId && userDeptId && targetDepartmentId !== userDeptId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden: Employees cannot access resources outside their assigned department',
                    });
                }
                return next();
            }
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient authorization level',
            });
        }
        catch (error) {
            console.error('requireDepartmentAccess middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during department authorization check',
            });
        }
    };
}
exports.default = requireDepartmentAccess;
//# sourceMappingURL=requireDepartmentAccess.js.map