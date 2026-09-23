"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRepository = exports.MaintenanceRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class MaintenanceRepository {
    constructor() {
        this.defaultInclude = {
            asset: {
                include: {
                    department: true,
                    assignments: {
                        where: { isCurrent: true },
                        include: {
                            employee: {
                                include: {
                                    department: true,
                                },
                            },
                        },
                    },
                },
            },
            inspectionTests: {
                orderBy: { createdAt: 'desc' },
            },
        };
    }
    async findMany(params) {
        const { search, status, priority, category, technician, assetId, skip, take } = params;
        const where = {};
        if (status && status !== 'all') {
            where.status = status;
        }
        if (priority && priority !== 'all') {
            where.priority = priority;
        }
        if (category && category !== 'all') {
            where.title = category;
        }
        if (technician && technician !== 'all') {
            where.assignedTechnician = { contains: technician, mode: 'insensitive' };
        }
        if (assetId) {
            where.assetId = assetId;
        }
        if (search && search.trim() !== '') {
            const term = search.trim();
            where.OR = [
                { ticketNumber: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { reportedBy: { contains: term, mode: 'insensitive' } },
                { assignedTechnician: { contains: term, mode: 'insensitive' } },
                { asset: { name: { contains: term, mode: 'insensitive' } } },
                { asset: { assetCode: { contains: term, mode: 'insensitive' } } },
            ];
        }
        const [tickets, total] = await Promise.all([
            prisma_1.default.maintenanceTicket.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: this.defaultInclude,
            }),
            prisma_1.default.maintenanceTicket.count({ where }),
        ]);
        return { tickets, total };
    }
    async findById(id) {
        return prisma_1.default.maintenanceTicket.findUnique({
            where: { id },
            include: this.defaultInclude,
        });
    }
    async findByTicketNumber(ticketNumber) {
        return prisma_1.default.maintenanceTicket.findUnique({
            where: { ticketNumber },
            include: this.defaultInclude,
        });
    }
    async generateTicketNumber() {
        const year = new Date().getFullYear();
        const count = await prisma_1.default.maintenanceTicket.count();
        const sequence = String(count + 1).padStart(4, '0');
        let ticketNum = `EEC-MNT-${year}-${sequence}`;
        // Ensure uniqueness
        let exists = await prisma_1.default.maintenanceTicket.findUnique({
            where: { ticketNumber: ticketNum },
        });
        let extra = 1;
        while (exists) {
            ticketNum = `EEC-MNT-${year}-${String(count + 1 + extra).padStart(4, '0')}`;
            exists = await prisma_1.default.maintenanceTicket.findUnique({
                where: { ticketNumber: ticketNum },
            });
            extra++;
        }
        return ticketNum;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [openTickets, inProgress, testing, completedThisMonth, recentTickets] = await Promise.all([
            prisma_1.default.maintenanceTicket.count({ where: { status: 'OPEN' } }),
            prisma_1.default.maintenanceTicket.count({ where: { status: 'IN_PROGRESS' } }),
            prisma_1.default.maintenanceTicket.count({ where: { status: 'TESTING' } }),
            prisma_1.default.maintenanceTicket.count({
                where: {
                    status: 'COMPLETED',
                    completedDate: { gte: startOfMonth },
                },
            }),
            prisma_1.default.maintenanceTicket.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: this.defaultInclude,
            }),
        ]);
        return {
            openTickets,
            inProgress,
            testing,
            completedThisMonth,
            recentTickets,
        };
    }
}
exports.MaintenanceRepository = MaintenanceRepository;
exports.maintenanceRepository = new MaintenanceRepository();
//# sourceMappingURL=maintenance.repository.js.map