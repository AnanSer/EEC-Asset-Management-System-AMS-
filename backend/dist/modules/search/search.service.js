"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchService = exports.SearchService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class SearchService {
    async search(query) {
        const q = (query || '').trim();
        if (q.length < 2) {
            return {
                assets: [],
                employees: [],
                departments: [],
                maintenance: [],
            };
        }
        const words = q.split(/\s+/).filter(Boolean);
        const employeeOrConditions = [
            { employeeId: { contains: q, mode: 'insensitive' } },
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
        ];
        if (words.length > 1) {
            employeeOrConditions.push({
                AND: [
                    { firstName: { contains: words[0], mode: 'insensitive' } },
                    { lastName: { contains: words.slice(1).join(' '), mode: 'insensitive' } },
                ],
            });
        }
        const [assets, employees, departments, maintenanceTickets] = await Promise.all([
            // 1. Assets (limit 5): assetCode, name (assetName), serialNumber
            prisma_1.default.asset.findMany({
                where: {
                    OR: [
                        { assetCode: { contains: q, mode: 'insensitive' } },
                        { name: { contains: q, mode: 'insensitive' } },
                        { serialNumber: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: {
                    department: {
                        select: { name: true },
                    },
                },
            }),
            // 2. Employees (limit 5): fullName, employeeId, email
            prisma_1.default.employeeProfile.findMany({
                where: {
                    OR: employeeOrConditions,
                },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: {
                    user: {
                        select: { email: true },
                    },
                    department: {
                        select: { name: true },
                    },
                },
            }),
            // 3. Departments (limit 5): departmentCode (code), departmentName (name)
            prisma_1.default.department.findMany({
                where: {
                    OR: [
                        { code: { contains: q, mode: 'insensitive' } },
                        { name: { contains: q, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                orderBy: { updatedAt: 'desc' },
            }),
            // 4. Maintenance Tickets (limit 5): ticketNumber, assetName, employeeName
            prisma_1.default.maintenanceTicket.findMany({
                where: {
                    OR: [
                        { ticketNumber: { contains: q, mode: 'insensitive' } },
                        { asset: { name: { contains: q, mode: 'insensitive' } } },
                        { asset: { assetCode: { contains: q, mode: 'insensitive' } } },
                        { reportedBy: { contains: q, mode: 'insensitive' } },
                        { assignedTechnician: { contains: q, mode: 'insensitive' } },
                        {
                            asset: {
                                assignments: {
                                    some: {
                                        isCurrent: true,
                                        employee: {
                                            OR: [
                                                { firstName: { contains: q, mode: 'insensitive' } },
                                                { lastName: { contains: q, mode: 'insensitive' } },
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: {
                    asset: {
                        select: {
                            name: true,
                            assetCode: true,
                        },
                    },
                },
            }),
        ]);
        return {
            assets: assets.map((a) => ({
                id: a.id,
                assetCode: a.assetCode,
                name: a.name,
                serialNumber: a.serialNumber,
                category: a.category,
                status: a.status,
                condition: a.condition,
                departmentName: a.department?.name,
            })),
            employees: employees.map((e) => ({
                id: e.id,
                fullName: `${e.firstName} ${e.lastName}`.trim(),
                employeeId: e.employeeId,
                email: e.user?.email || '',
                departmentName: e.department?.name,
                jobTitle: e.jobTitle,
                isActive: e.isActive,
            })),
            departments: departments.map((d) => ({
                id: d.id,
                departmentCode: d.code,
                departmentName: d.name,
                location: d.location || d.officeLocation || undefined,
                isActive: d.isActive,
            })),
            maintenance: maintenanceTickets.map((m) => ({
                id: m.id,
                ticketNumber: m.ticketNumber,
                title: m.title,
                assetName: m.asset?.name || 'Unknown Asset',
                employeeName: m.reportedBy || m.assignedTechnician || 'Unassigned',
                status: m.status,
                priority: m.priority,
            })),
        };
    }
}
exports.SearchService = SearchService;
exports.searchService = new SearchService();
//# sourceMappingURL=search.service.js.map