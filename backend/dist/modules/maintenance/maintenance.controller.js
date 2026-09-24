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
const api_1 = require("../../lib/api");
class MaintenanceController {
    handleError(res, error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json((0, api_1.errorResponse)('Validation failed', 'VALIDATION_ERROR', error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }))));
        }
        if (error instanceof maintenance_service_1.AppError) {
            return res.status(error.statusCode).json((0, api_1.errorResponse)(error.message, 'APP_ERROR', error.errors));
        }
        const err = error;
        return res.status(500).json((0, api_1.errorResponse)(err.message || 'Internal server error', 'INTERNAL_ERROR'));
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
                            const whereClause = {
                                OR: personalConditions,
                            };
                            if (validatedQuery.status) {
                                whereClause.status = validatedQuery.status;
                            }
                            const tickets = await prisma_1.default.maintenanceTicket.findMany({
                                where: whereClause,
                                include: {
                                    asset: {
                                        include: {
                                            department: { select: { id: true, code: true, name: true } },
                                        },
                                    },
                                },
                                orderBy: { createdAt: 'desc' },
                            });
                            const pagination = (0, api_1.buildPagination)(1, 10, tickets.length);
                            return res.status(200).json((0, api_1.paginatedResponse)(tickets, pagination));
                        }
                        else {
                            const pagination = (0, api_1.buildPagination)(1, 10, 0);
                            return res.status(200).json((0, api_1.paginatedResponse)([], pagination));
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
                        const pagination = (0, api_1.buildPagination)(1, 10, deptTickets.length);
                        return res.status(200).json((0, api_1.paginatedResponse)(deptTickets, pagination));
                    }
                }
            }
            const result = await maintenance_service_1.maintenanceService.getTickets(validatedQuery);
            const pagination = (0, api_1.buildPagination)(result.meta.page, result.meta.limit, result.meta.total);
            return res.status(200).json((0, api_1.paginatedResponse)(result.tickets, pagination));
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
            return res.status(200).json((0, api_1.successResponse)(technicians));
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
                return res.status(404).json((0, api_1.errorResponse)('Maintenance ticket not found', 'NOT_FOUND'));
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
                        return res.status(403).json((0, api_1.errorResponse)('Forbidden: You do not have permission to view this maintenance ticket', 'FORBIDDEN'));
                    }
                }
            }
            return res.status(200).json((0, api_1.successResponse)(ticket));
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
                        return res.status(403).json((0, api_1.errorResponse)('Forbidden: No employee profile associated with this account', 'FORBIDDEN'));
                    }
                    const isAssigned = await prisma_1.default.assetAssignment.findFirst({
                        where: {
                            assetId: validatedData.assetId,
                            employeeId: user.employeeProfile.id,
                            isCurrent: true,
                        },
                    });
                    if (!isAssigned) {
                        return res.status(403).json((0, api_1.errorResponse)('Forbidden: Employees can only report maintenance tickets for assets currently assigned to them', 'FORBIDDEN'));
                    }
                    // Ensure reportedBy is set to employee name/id
                    if (!validatedData.reportedBy) {
                        validatedData.reportedBy = user.employeeProfile.employeeId;
                    }
                }
            }
            const ticket = await maintenance_service_1.maintenanceService.createTicket(validatedData);
            return res.status(201).json((0, api_1.createdResponse)(ticket, undefined, 'Maintenance ticket created successfully'));
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
            return res.status(200).json((0, api_1.successResponse)(ticket, undefined, 'Maintenance ticket updated successfully'));
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
            return res.status(200).json((0, api_1.successResponse)(ticket, undefined, 'Maintenance ticket status updated successfully'));
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
    async getDashboardStats(req, res) {
        try {
            const stats = await maintenance_service_1.maintenanceService.getDashboardStats();
            return res.status(200).json((0, api_1.successResponse)(stats));
        }
        catch (error) {
            return this.handleError(res, error);
        }
    }
}
exports.MaintenanceController = MaintenanceController;
exports.maintenanceController = new MaintenanceController();
//# sourceMappingURL=maintenance.controller.js.map