"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceService = exports.MaintenanceService = exports.AppError = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const maintenance_repository_1 = require("./maintenance.repository");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class MaintenanceService {
    constructor(repo = maintenance_repository_1.maintenanceRepository) {
        this.repo = repo;
    }
    formatTicket(ticket) {
        if (!ticket)
            return null;
        const currentAssignment = ticket.asset?.assignments?.[0];
        const currentHolder = currentAssignment?.employee
            ? {
                id: currentAssignment.employee.id,
                employeeId: currentAssignment.employee.employeeId,
                fullName: `${currentAssignment.employee.firstName} ${currentAssignment.employee.lastName}`.trim(),
                departmentName: currentAssignment.employee.department?.name,
            }
            : null;
        return {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            assetId: ticket.assetId,
            category: ticket.title,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            cost: ticket.cost ? Number(ticket.cost) : null,
            startDate: ticket.startDate,
            completedDate: ticket.completedDate,
            reportedBy: ticket.reportedBy,
            assignedTechnician: ticket.assignedTechnician,
            resolutionNotes: ticket.resolutionNotes,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            asset: ticket.asset
                ? {
                    id: ticket.asset.id,
                    assetCode: ticket.asset.assetCode,
                    name: ticket.asset.name,
                    category: ticket.asset.category,
                    brand: ticket.asset.brand,
                    model: ticket.asset.model,
                    serialNumber: ticket.asset.serialNumber,
                    status: ticket.asset.status,
                    condition: ticket.asset.condition,
                    department: ticket.asset.department,
                    currentHolder,
                }
                : null,
            inspectionTests: ticket.inspectionTests || [],
            latestInspection: ticket.inspectionTests?.[0] || null,
        };
    }
    async getTickets(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const { tickets, total } = await this.repo.findMany({
            search: query.search,
            status: query.status,
            priority: query.priority,
            category: query.category,
            technician: query.technician,
            assetId: query.assetId,
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            tickets: tickets.map((t) => this.formatTicket(t)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    async getTicketById(id) {
        const ticket = await this.repo.findById(id);
        if (!ticket) {
            throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
        }
        return this.formatTicket(ticket);
    }
    async createTicket(data) {
        // 1. Validate Asset
        const asset = await prisma_1.default.asset.findUnique({
            where: { id: data.assetId },
            include: { assignments: { where: { isCurrent: true } } },
        });
        if (!asset) {
            throw new AppError(`Asset with ID '${data.assetId}' not found`, 404);
        }
        if (asset.status === 'RETIRED' || asset.status === 'DISPOSED') {
            throw new AppError(`Cannot create maintenance ticket for ${asset.status.toLowerCase()} asset`, 422);
        }
        // 2. Validate Technician (if provided as employeeId or employee UUID)
        if (data.assignedTechnician) {
            const techProfile = await prisma_1.default.employeeProfile.findFirst({
                where: {
                    OR: [
                        { id: data.assignedTechnician },
                        { employeeId: data.assignedTechnician },
                        {
                            user: {
                                role: 'IT_TECHNICIAN',
                                email: data.assignedTechnician,
                            },
                        },
                    ],
                },
                include: { user: true },
            });
            if (techProfile && techProfile.user?.role !== 'IT_TECHNICIAN') {
                throw new AppError('Assigned technician must hold the IT_TECHNICIAN role', 422);
            }
        }
        const ticketNumber = await this.repo.generateTicketNumber();
        const initialStatus = data.status || 'OPEN';
        // 3. Prisma Transaction: Create Ticket & Update Asset Status
        const createdTicket = await prisma_1.default.$transaction(async (tx) => {
            const ticket = await tx.maintenanceTicket.create({
                data: {
                    ticketNumber,
                    assetId: data.assetId,
                    title: data.category,
                    description: data.description,
                    priority: data.priority,
                    status: initialStatus,
                    reportedBy: data.reportedBy,
                    assignedTechnician: data.assignedTechnician,
                    cost: data.cost != null ? data.cost : null,
                    startDate: data.startDate ? new Date(data.startDate) : initialStatus === 'IN_PROGRESS' ? new Date() : null,
                    resolutionNotes: data.resolutionNotes || null,
                },
            });
            // Update Asset Status to MAINTENANCE
            let targetAssetStatus = 'MAINTENANCE';
            if (initialStatus === 'TESTING') {
                targetAssetStatus = 'TESTING';
            }
            await tx.asset.update({
                where: { id: data.assetId },
                data: { status: targetAssetStatus },
            });
            return ticket;
        });
        const populated = await this.repo.findById(createdTicket.id);
        return this.formatTicket(populated);
    }
    async updateTicket(id, data) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
        }
        if (data.status && data.status !== existing.status) {
            return this.updateStatus(id, {
                status: data.status,
                resolutionNotes: data.resolutionNotes,
            });
        }
        const updated = await prisma_1.default.maintenanceTicket.update({
            where: { id },
            data: {
                ...(data.category ? { title: data.category } : {}),
                ...(data.priority ? { priority: data.priority } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.reportedBy !== undefined ? { reportedBy: data.reportedBy } : {}),
                ...(data.assignedTechnician !== undefined ? { assignedTechnician: data.assignedTechnician } : {}),
                ...(data.cost !== undefined ? { cost: data.cost } : {}),
                ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
                ...(data.completedDate ? { completedDate: new Date(data.completedDate) } : {}),
                ...(data.resolutionNotes !== undefined ? { resolutionNotes: data.resolutionNotes } : {}),
            },
            include: this.repo.defaultInclude,
        });
        return this.formatTicket(updated);
    }
    async updateStatus(id, data) {
        const ticket = await this.repo.findById(id);
        if (!ticket) {
            throw new AppError(`Maintenance ticket with ID '${id}' not found`, 404);
        }
        const newStatus = data.status;
        const now = new Date();
        // Check testing prerequisite if moving to COMPLETED
        if (newStatus === 'COMPLETED') {
            const latestTest = ticket.inspectionTests?.[0];
            if (latestTest && !latestTest.passed) {
                throw new AppError('Cannot complete ticket: latest inspection test did not pass', 422);
            }
        }
        const updatedTicket = await prisma_1.default.$transaction(async (tx) => {
            // 1. Determine Asset Status based on Ticket Status & Active Custody
            let targetAssetStatus = undefined;
            if (newStatus === 'OPEN' || newStatus === 'IN_PROGRESS') {
                targetAssetStatus = 'MAINTENANCE';
            }
            else if (newStatus === 'TESTING') {
                targetAssetStatus = 'TESTING';
            }
            else if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
                // If asset has a current assignment, restore to ASSIGNED, else AVAILABLE
                const activeAssignment = await tx.assetAssignment.findFirst({
                    where: { assetId: ticket.assetId, isCurrent: true },
                });
                targetAssetStatus = activeAssignment ? 'ASSIGNED' : 'AVAILABLE';
            }
            if (targetAssetStatus) {
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: { status: targetAssetStatus },
                });
            }
            // 2. Update MaintenanceTicket dates and status
            const updateData = {
                status: newStatus,
            };
            if (data.resolutionNotes !== undefined) {
                updateData.resolutionNotes = data.resolutionNotes;
            }
            if (newStatus === 'IN_PROGRESS' && !ticket.startDate) {
                updateData.startDate = now;
            }
            if (newStatus === 'COMPLETED') {
                updateData.completedDate = now;
            }
            const updated = await tx.maintenanceTicket.update({
                where: { id },
                data: updateData,
            });
            return updated;
        });
        const populated = await this.repo.findById(updatedTicket.id);
        return this.formatTicket(populated);
    }
    async getDashboardStats() {
        const stats = await this.repo.getDashboardStats();
        return {
            openTickets: stats.openTickets,
            inProgress: stats.inProgress,
            testing: stats.testing,
            completedThisMonth: stats.completedThisMonth,
            recentTickets: stats.recentTickets.map((t) => this.formatTicket(t)),
        };
    }
}
exports.MaintenanceService = MaintenanceService;
exports.maintenanceService = new MaintenanceService();
//# sourceMappingURL=maintenance.service.js.map