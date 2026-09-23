"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentRepository = exports.AssignmentRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const assignmentInclude = {
    asset: {
        select: {
            id: true,
            assetCode: true,
            name: true,
            category: true,
            brand: true,
            model: true,
            serialNumber: true,
            status: true,
            condition: true,
            departmentId: true,
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    },
    employee: {
        select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            departmentId: true,
            department: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
    },
};
class AssignmentRepository {
    async findMany(params) {
        const { search, departmentId, employeeId, assetId, isCurrent, skip, take } = params;
        const where = {};
        if (typeof isCurrent === 'boolean') {
            where.isCurrent = isCurrent;
        }
        if (employeeId && employeeId !== 'all') {
            where.employeeId = employeeId;
        }
        if (assetId && assetId !== 'all') {
            where.assetId = assetId;
        }
        if (departmentId && departmentId !== 'all') {
            where.employee = {
                departmentId,
            };
        }
        if (search && search.trim() !== '') {
            const term = search.trim();
            where.OR = [
                { asset: { assetCode: { contains: term, mode: 'insensitive' } } },
                { asset: { name: { contains: term, mode: 'insensitive' } } },
                { employee: { firstName: { contains: term, mode: 'insensitive' } } },
                { employee: { lastName: { contains: term, mode: 'insensitive' } } },
                { employee: { employeeId: { contains: term, mode: 'insensitive' } } },
            ];
        }
        const [assignments, total] = await Promise.all([
            prisma_1.default.assetAssignment.findMany({
                where,
                skip,
                take,
                orderBy: { assignedDate: 'desc' },
                include: assignmentInclude,
            }),
            prisma_1.default.assetAssignment.count({ where }),
        ]);
        return { assignments, total };
    }
    async findById(id) {
        return prisma_1.default.assetAssignment.findUnique({
            where: { id },
            include: assignmentInclude,
        });
    }
    async findActiveByAssetId(assetId) {
        return prisma_1.default.assetAssignment.findFirst({
            where: {
                assetId,
                isCurrent: true,
            },
            include: assignmentInclude,
        });
    }
    async findHistoryByAssetId(assetId) {
        return prisma_1.default.assetAssignment.findMany({
            where: { assetId },
            orderBy: { assignedDate: 'desc' },
            include: assignmentInclude,
        });
    }
    async getDashboardStats() {
        const [availableAssets, assignedAssets, employeesWithAssetsCount, recentAssignments, totalAssignments, activeAssignments, returnedAssignments,] = await Promise.all([
            prisma_1.default.asset.count({ where: { status: 'AVAILABLE' } }),
            prisma_1.default.asset.count({ where: { status: 'ASSIGNED' } }),
            prisma_1.default.assetAssignment
                .groupBy({
                by: ['employeeId'],
                where: { isCurrent: true },
            })
                .then((groups) => groups.length),
            prisma_1.default.assetAssignment.findMany({
                take: 5,
                orderBy: { assignedDate: 'desc' },
                include: assignmentInclude,
            }),
            prisma_1.default.assetAssignment.count(),
            prisma_1.default.assetAssignment.count({ where: { isCurrent: true } }),
            prisma_1.default.assetAssignment.count({ where: { isCurrent: false } }),
        ]);
        return {
            availableAssets,
            assignedAssets,
            employeesWithAssets: employeesWithAssetsCount,
            recentAssignments,
            totalAssignments,
            activeAssignments,
            returnedAssignments,
        };
    }
}
exports.AssignmentRepository = AssignmentRepository;
exports.assignmentRepository = new AssignmentRepository();
//# sourceMappingURL=assignment.repository.js.map