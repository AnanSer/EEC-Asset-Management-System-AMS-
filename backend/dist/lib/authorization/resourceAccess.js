"use strict";
/**
 * EEC EAMS – Resource Ownership Authorization Helpers (Phase 9D.3)
 * Centralizes granular ownership and department boundary checks for:
 * - Employees
 * - Departments
 * - Assets
 * - Maintenance Tickets
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canAccessEmployee = canAccessEmployee;
exports.canAccessDepartment = canAccessDepartment;
exports.canAccessAsset = canAccessAsset;
exports.canAccessMaintenanceTicket = canAccessMaintenanceTicket;
const constants_1 = require("../../constants");
/**
 * Validates access to an Employee Profile resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> employee.departmentId === manager.departmentId
 * - EMPLOYEE -> employee.userId === auth.userId
 */
function canAccessEmployee(auth, employee) {
    if (!auth)
        return false;
    const role = auth.role;
    // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
    if (role === constants_1.ROLES.ADMIN || role === constants_1.ROLES.IT_TECHNICIAN) {
        return true;
    }
    // Rule 3: DEPARTMENT_MANAGER can only access employees in their department
    if (role === constants_1.ROLES.DEPARTMENT_MANAGER) {
        if (!auth.departmentId || !employee.departmentId)
            return false;
        return auth.departmentId === employee.departmentId;
    }
    // Rule 4: EMPLOYEE can only access their own profile
    if (role === constants_1.ROLES.EMPLOYEE) {
        if (employee.userId && auth.userId) {
            return employee.userId === auth.userId;
        }
        if (employee.id && auth.employeeProfileId) {
            return employee.id === auth.employeeProfileId;
        }
        if (employee.employeeId && auth.employeeId) {
            return employee.employeeId === auth.employeeId;
        }
        return false;
    }
    return false;
}
/**
 * Validates access to a Department resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> own department only
 * - EMPLOYEE -> own department only
 */
function canAccessDepartment(auth, departmentId) {
    if (!auth)
        return false;
    const role = auth.role;
    // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
    if (role === constants_1.ROLES.ADMIN || role === constants_1.ROLES.IT_TECHNICIAN) {
        return true;
    }
    if (!departmentId || !auth.departmentId) {
        return false;
    }
    // Rules 3 & 4: DEPARTMENT_MANAGER & EMPLOYEE can only access own department
    if (role === constants_1.ROLES.DEPARTMENT_MANAGER || role === constants_1.ROLES.EMPLOYEE) {
        return auth.departmentId === departmentId;
    }
    return false;
}
/**
 * Validates access to an Asset resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> asset.departmentId === manager.departmentId
 * - EMPLOYEE -> currently assigned asset only
 */
function canAccessAsset(auth, asset) {
    if (!auth)
        return false;
    const role = auth.role;
    // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
    if (role === constants_1.ROLES.ADMIN || role === constants_1.ROLES.IT_TECHNICIAN) {
        return true;
    }
    // Rule 3: DEPARTMENT_MANAGER -> asset.departmentId === manager.departmentId
    if (role === constants_1.ROLES.DEPARTMENT_MANAGER) {
        if (!auth.departmentId || !asset.departmentId)
            return false;
        return auth.departmentId === asset.departmentId;
    }
    // Rule 4: EMPLOYEE -> currently assigned asset only
    if (role === constants_1.ROLES.EMPLOYEE) {
        // Check direct assignment key
        if (asset.assignedToEmployeeId && auth.employeeProfileId) {
            if (asset.assignedToEmployeeId === auth.employeeProfileId)
                return true;
        }
        // Check currentAssignment object
        if (asset.currentAssignment) {
            if (asset.currentAssignment.employeeId &&
                auth.employeeProfileId &&
                asset.currentAssignment.employeeId === auth.employeeProfileId) {
                return true;
            }
            if (asset.currentAssignment.employee?.userId &&
                auth.userId &&
                asset.currentAssignment.employee.userId === auth.userId) {
                return true;
            }
            if (asset.currentAssignment.employee?.employeeId &&
                auth.employeeId &&
                asset.currentAssignment.employee.employeeId === auth.employeeId) {
                return true;
            }
        }
        // Check assignments array for active assignment
        if (Array.isArray(asset.assignments)) {
            const isAssigned = asset.assignments.some((assignment) => {
                if (assignment.isCurrent === false)
                    return false;
                if (assignment.employeeId &&
                    auth.employeeProfileId &&
                    assignment.employeeId === auth.employeeProfileId) {
                    return true;
                }
                if (assignment.employee?.userId &&
                    auth.userId &&
                    assignment.employee.userId === auth.userId) {
                    return true;
                }
                if (assignment.employee?.employeeId &&
                    auth.employeeId &&
                    assignment.employee.employeeId === auth.employeeId) {
                    return true;
                }
                return false;
            });
            if (isAssigned)
                return true;
        }
        return false;
    }
    return false;
}
/**
 * Validates access to a Maintenance Ticket resource.
 * Rules:
 * - ADMIN -> true
 * - IT_TECHNICIAN -> true
 * - DEPARTMENT_MANAGER -> ticket.departmentId === manager.departmentId (or asset department)
 * - EMPLOYEE -> reportedByUserId === auth.userId
 */
function canAccessMaintenanceTicket(auth, ticket) {
    if (!auth)
        return false;
    const role = auth.role;
    // Rules 1 & 2: ADMIN & IT_TECHNICIAN bypass
    if (role === constants_1.ROLES.ADMIN || role === constants_1.ROLES.IT_TECHNICIAN) {
        return true;
    }
    // Rule 3: DEPARTMENT_MANAGER -> ticket.departmentId === manager.departmentId
    if (role === constants_1.ROLES.DEPARTMENT_MANAGER) {
        const ticketDept = ticket.departmentId || ticket.asset?.departmentId;
        if (!auth.departmentId || !ticketDept)
            return false;
        return auth.departmentId === ticketDept;
    }
    // Rule 4: EMPLOYEE -> reportedByUserId === auth.userId
    if (role === constants_1.ROLES.EMPLOYEE) {
        if (ticket.reportedByUserId && auth.userId) {
            if (ticket.reportedByUserId === auth.userId)
                return true;
        }
        if (ticket.reportedBy) {
            if (ticket.reportedBy === auth.userId)
                return true;
            if (auth.employeeId && ticket.reportedBy === auth.employeeId)
                return true;
            if (auth.employeeProfileId && ticket.reportedBy === auth.employeeProfileId)
                return true;
        }
        if (ticket.reportedByEmployeeId && auth.employeeProfileId) {
            if (ticket.reportedByEmployeeId === auth.employeeProfileId)
                return true;
        }
        return false;
    }
    return false;
}
//# sourceMappingURL=resourceAccess.js.map