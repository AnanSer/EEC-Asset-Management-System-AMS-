"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceController = exports.MaintenanceController = void 0;
const maintenance_service_1 = require("./maintenance.service");
const maintenance_validator_1 = require("./maintenance.validator");
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const constants_1 = require("../../constants");
const authorization_1 = require("../../lib/authorization");
class MaintenanceController {
    handleError(res, error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        if (error instanceof maintenance_service_1.AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                errors: error.errors,
            });
        }
        const err = error;
        return res.status(500).json({
            success: false,
            message: err.message || 'Internal server error',
        });
    }
    async getTickets(req, res) {
        try {
            const validatedQuery = maintenance_validator_1.maintenanceQuerySchema.parse(req.query);
            // Scoped access based on authenticated user role
            if (req.auth?.user) {
                const user = await prisma_1.default.user.findFirst({
                    where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                    include: { employeeProfile: true },
                });
                if (user) {
                    const role = user.role;
                    const isPersonal = validatedQuery.personal === 'true' || validatedQuery.personal === true || role === constants_1.ROLES.EMPLOYEE;
                    // Personal view: View tickets assigned to technician (IT_TECHNICIAN) OR reported by/assigned to user (EMPLOYEE, MANAGER)
                    if (isPersonal) {
                        if (user.employeeProfile) {
                            const personalConditions = [];
                            if (role === constants_1.ROLES.IT_TECHNICIAN) {
                                // IT Technician personal view: tickets assigned to this technician
                                personalConditions.push({ assignedTechnician: user.id }, { assignedTechnician: user.employeeProfile.employeeId }, { assignedTechnician: user.employeeProfile.id }, {
                                    AND: [
                                        { assignedTechnician: { contains: user.employeeProfile.firstName, mode: 'insensitive' } },
                                        { assignedTechnician: { contains: user.employeeProfile.lastName, mode: 'insensitive' } },
                                    ],
                                }, { assignedTechnician: { contains: user.employeeProfile.firstName, mode: 'insensitive' } });
                            }
                            else {
                                // Employee & Department Manager personal view: reported by user OR assigned asset
                                personalConditions.push({ reportedBy: user.id }, { reportedBy: user.employeeProfile.employeeId }, { reportedBy: user.employeeProfile.id }, { reportedBy: { contains: user.employeeProfile.firstName, mode: 'insensitive' } }, { reportedBy: { contains: user.employeeProfile.lastName, mode: 'insensitive' } }, {
                                    asset: {
                                        assignments: {
                                            some: {
                                                employeeId: user.employeeProfile.id,
                                                isCurrent: true,
                                            },
                                        },
                                    },
                                });
                            }
                            const tickets = await prisma_1.default.maintenanceTicket.findMany({
                                where: {
                                    OR: personalConditions,
                                },
                                include: {
                                    asset: {
                                        include: {
                                            department: { select: { id: true, code: true, name: true } },
                                        },
                                    },
                                },
                                orderBy: { createdAt: 'desc' },
                            });
                            return res.status(200).json({
                                success: true,
                                data: tickets,
                                meta: { total: tickets.length, page: 1, limit: 10, totalPages: 1 },
                            });
                        }
                        else {
                            return res.status(200).json({
                                success: true,
                                data: [],
                                meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
                            });
                        }
                    }
                    // DEPARTMENT_MANAGER: View maintenance tickets belonging to own department only
                    if (role === constants_1.ROLES.DEPARTMENT_MANAGER && user.employeeProfile?.departmentId) {
                        const deptTickets = await prisma_1.default.maintenanceTicket.findMany({
                            where: {
                                asset: {
                                    departmentId: user.employeeProfile.departmentId,
                                },
                            },
                            include: {
                                asset: {
                                    include: {
                                        department: { select: { id: true, code: true, name: true } },
                                    },
                                },
                            },
                            orderBy: { createdAt: 'desc' },
                        });
                        return res.status(200).json({
                            success: true,
                            data: deptTickets,
                            meta: { total: deptTickets.length, page: 1, limit: 10, totalPages: 1 },
                        });
                    }
                }
            }
            const result = await maintenance_service_1.maintenanceService.getTickets(validatedQuery);
            return res.status(200).json({
                success: true,
                data: result.tickets,
                meta: result.meta,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getTechnicians(req, res) {
        try {
            const techUsers = await prisma_1.default.user.findMany({
                where: {
                    role: constants_1.ROLES.IT_TECHNICIAN,
                    status: 'APPROVED',
                    employeeProfile: {
                        isActive: true,
                    },
                },
                include: {
                    employeeProfile: {
                        include: {
                            department: { select: { id: true, code: true, name: true } },
                        },
                    },
                },
            });
            const technicians = techUsers
                .filter((u) => u.employeeProfile !== null)
                .map((u) => {
                const ep = u.employeeProfile;
                return {
                    id: ep.id,
                    employeeId: ep.employeeId,
                    firstName: ep.firstName,
                    lastName: ep.lastName,
                    fullName: `${ep.firstName} ${ep.lastName}`.trim(),
                    department: ep.department ? { id: ep.department.id, name: ep.department.name, code: ep.department.code } : null,
                    user: { id: u.id, email: u.email, role: u.role },
                };
            });
            return res.status(200).json({
                success: true,
                data: technicians,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getTicketById(req, res) {
        try {
            const id = String(req.params.id);
            const ticket = await maintenance_service_1.maintenanceService.getTicketById(id);
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Maintenance ticket not found',
                });
            }
            // Check ownership & department access
            if (req.auth?.user) {
                const user = await prisma_1.default.user.findFirst({
                    where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                    include: { employeeProfile: true },
                });
                if (user) {
                    const authContext = {
                        userId: user.id,
                        role: user.role,
                        departmentId: user.employeeProfile?.departmentId,
                        employeeProfileId: user.employeeProfile?.id,
                        employeeId: user.employeeProfile?.employeeId,
                        name: user.employeeProfile
                            ? `${user.employeeProfile.firstName} ${user.employeeProfile.lastName}`.trim()
                            : null,
                    };
                    const allowed = (0, authorization_1.canAccessMaintenanceTicket)(authContext, ticket);
                    if (!allowed) {
                        return res.status(403).json({
                            success: false,
                            message: 'Forbidden: You do not have permission to view this maintenance ticket',
                        });
                    }
                }
            }
            return res.status(200).json({
                success: true,
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async createTicket(req, res) {
        try {
            const validatedData = maintenance_validator_1.createMaintenanceSchema.parse(req.body);
            // EMPLOYEE: Create maintenance ticket only for their assigned assets
            if (req.auth?.user) {
                const user = await prisma_1.default.user.findFirst({
                    where: { OR: [{ id: req.auth.user.id }, { email: req.auth.user.email }] },
                    include: { employeeProfile: true },
                });
                if (user && user.role === constants_1.ROLES.EMPLOYEE) {
                    if (!user.employeeProfile) {
                        return res.status(403).json({
                            success: false,
                            message: 'Forbidden: No employee profile associated with this account',
                        });
                    }
                    const isAssigned = await prisma_1.default.assetAssignment.findFirst({
                        where: {
                            assetId: validatedData.assetId,
                            employeeId: user.employeeProfile.id,
                            isCurrent: true,
                        },
                    });
                    if (!isAssigned) {
                        return res.status(403).json({
                            success: false,
                            message: 'Forbidden: Employees can only report maintenance tickets for assets currently assigned to them',
                        });
                    }
                    // Ensure reportedBy is set to employee name/id
                    if (!validatedData.reportedBy) {
                        validatedData.reportedBy = user.employeeProfile.employeeId;
                    }
                }
            }
            const ticket = await maintenance_service_1.maintenanceService.createTicket(validatedData);
            return res.status(201).json({
                success: true,
                message: 'Maintenance ticket created successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async updateTicket(req, res) {
        try {
            const id = String(req.params.id);
            const validatedData = maintenance_validator_1.updateMaintenanceSchema.parse(req.body);
            const ticket = await maintenance_service_1.maintenanceService.updateTicket(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Maintenance ticket updated successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async updateStatus(req, res) {
        try {
            const id = String(req.params.id);
            const validatedData = maintenance_validator_1.updateMaintenanceStatusSchema.parse(req.body);
            const ticket = await maintenance_service_1.maintenanceService.updateStatus(id, validatedData);
            return res.status(200).json({
                success: true,
                message: 'Maintenance ticket status updated successfully',
                data: ticket,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await maintenance_service_1.maintenanceService.getDashboardStats();
            return res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
exports.maintenanceController = new MaintenanceController();
//# sourceMappingURL=maintenance.controller.js.map