"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentService = exports.AssignmentService = exports.AppError = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const assignment_repository_1 = require("./assignment.repository");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class AssignmentService {
    constructor(repo = assignment_repository_1.assignmentRepository) {
        this.repo = repo;
    }
    formatAssignment(assignment) {
        if (!assignment)
            return null;
        const start = new Date(assignment.assignedDate).getTime();
        const end = assignment.returnedDate ? new Date(assignment.returnedDate).getTime() : Date.now();
        const durationDays = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        return {
            id: assignment.id,
            assetId: assignment.assetId,
            asset: assignment.asset
                ? {
                    id: assignment.asset.id,
                    assetCode: assignment.asset.assetCode,
                    name: assignment.asset.name,
                    category: assignment.asset.category,
                    brand: assignment.asset.brand,
                    model: assignment.asset.model,
                    serialNumber: assignment.asset.serialNumber,
                    status: assignment.asset.status,
                    condition: assignment.asset.condition,
                    department: assignment.asset.department,
                }
                : null,
            employeeId: assignment.employeeId,
            employee: assignment.employee
                ? {
                    id: assignment.employee.id,
                    employeeId: assignment.employee.employeeId,
                    firstName: assignment.employee.firstName,
                    lastName: assignment.employee.lastName,
                    fullName: `${assignment.employee.firstName} ${assignment.employee.lastName}`.trim(),
                    jobTitle: assignment.employee.jobTitle,
                    department: assignment.employee.department,
                    email: assignment.employee.user?.email,
                }
                : null,
            assignedDate: assignment.assignedDate,
            returnedDate: assignment.returnedDate,
            durationDays,
            conditionOnAssign: assignment.conditionOnAssign,
            conditionOnReturn: assignment.conditionOnReturn,
            isCurrent: assignment.isCurrent,
            remarks: assignment.notes,
            createdAt: assignment.createdAt,
            updatedAt: assignment.updatedAt,
        };
    }
    async getAssignments(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        let isCurrent = undefined;
        if (query.isCurrent === 'true')
            isCurrent = true;
        if (query.isCurrent === 'false')
            isCurrent = false;
        const { assignments, total } = await this.repo.findMany({
            search: query.search,
            departmentId: query.departmentId,
            employeeId: query.employeeId,
            assetId: query.assetId,
            isCurrent,
            skip,
            take: limit,
        });
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            assignments: assignments.map((a) => this.formatAssignment(a)),
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
    async getAssignmentById(id) {
        const assignment = await this.repo.findById(id);
        if (!assignment) {
            throw new AppError(`Assignment with ID '${id}' not found`, 404);
        }
        return this.formatAssignment(assignment);
    }
    async getAssetHistory(assetId) {
        const asset = await prisma_1.default.asset.findUnique({ where: { id: assetId } });
        if (!asset) {
            throw new AppError(`Asset with ID '${assetId}' not found`, 404);
        }
        const history = await this.repo.findHistoryByAssetId(assetId);
        return history.map((item) => this.formatAssignment(item));
    }
    async assignAsset(data) {
        // 1. Validate Asset
        const asset = await prisma_1.default.asset.findUnique({ where: { id: data.assetId } });
        if (!asset) {
            throw new AppError(`Asset with ID '${data.assetId}' not found`, 404);
        }
        if (asset.status !== 'AVAILABLE') {
            throw new AppError(`Asset '${asset.assetCode}' cannot be assigned because its current status is ${asset.status}. Only AVAILABLE assets can be assigned.`, 422);
        }
        // 2. Validate Employee
        const employee = await prisma_1.default.employeeProfile.findUnique({
            where: { id: data.employeeId },
            include: { department: true },
        });
        if (!employee) {
            throw new AppError(`Employee with ID '${data.employeeId}' not found`, 404);
        }
        if (!employee.isActive) {
            throw new AppError(`Employee '${employee.firstName} ${employee.lastName}' is inactive and cannot be assigned assets.`, 422);
        }
        const assignedDate = data.assignedDate ? new Date(data.assignedDate) : new Date();
        // 3. Atomic Transaction: Create Assignment & Update Asset Status
        const createdAssignment = await prisma_1.default.$transaction(async (tx) => {
            const assignment = await tx.assetAssignment.create({
                data: {
                    assetId: data.assetId,
                    employeeId: data.employeeId,
                    assignedDate,
                    conditionOnAssign: data.conditionOnAssign || asset.condition,
                    isCurrent: true,
                    notes: data.remarks || null,
                },
            });
            await tx.asset.update({
                where: { id: data.assetId },
                data: {
                    status: 'ASSIGNED',
                    departmentId: employee.departmentId || asset.departmentId,
                },
            });
            return assignment;
        });
        const populated = await this.repo.findById(createdAssignment.id);
        return this.formatAssignment(populated);
    }
    async transferAsset(assetId, data) {
        // 1. Validate Asset
        const asset = await prisma_1.default.asset.findUnique({ where: { id: assetId } });
        if (!asset) {
            throw new AppError(`Asset with ID '${assetId}' not found`, 404);
        }
        if (asset.status !== 'ASSIGNED') {
            throw new AppError(`Asset '${asset.assetCode}' must be in ASSIGNED status to be transferred (currently ${asset.status}).`, 422);
        }
        // 2. Validate Active Assignment
        const activeAssignment = await this.repo.findActiveByAssetId(assetId);
        if (!activeAssignment) {
            throw new AppError(`No active assignment record found for asset '${asset.assetCode}'.`, 404);
        }
        // 3. Validate New Employee
        const newEmployee = await prisma_1.default.employeeProfile.findUnique({
            where: { id: data.newEmployeeId },
            include: { department: true },
        });
        if (!newEmployee) {
            throw new AppError(`New employee with ID '${data.newEmployeeId}' not found`, 404);
        }
        if (!newEmployee.isActive) {
            throw new AppError(`Employee '${newEmployee.firstName} ${newEmployee.lastName}' is inactive and cannot receive assets.`, 422);
        }
        if (activeAssignment.employeeId === data.newEmployeeId) {
            throw new AppError('Asset is already assigned to this employee.', 422);
        }
        const transferDate = data.transferDate ? new Date(data.transferDate) : new Date();
        // 4. Atomic Transaction: Close active assignment & create new assignment
        const newAssignment = await prisma_1.default.$transaction(async (tx) => {
            // Close existing
            await tx.assetAssignment.update({
                where: { id: activeAssignment.id },
                data: {
                    returnedDate: transferDate,
                    isCurrent: false,
                    notes: activeAssignment.notes
                        ? `${activeAssignment.notes} | Transferred to ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`
                        : `Transferred to ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.employeeId})`,
                },
            });
            // Create new
            const created = await tx.assetAssignment.create({
                data: {
                    assetId,
                    employeeId: data.newEmployeeId,
                    assignedDate: transferDate,
                    conditionOnAssign: data.conditionOnTransfer || asset.condition,
                    isCurrent: true,
                    notes: data.remarks || null,
                },
            });
            // Update asset's department if employee belongs to a department
            if (newEmployee.departmentId) {
                await tx.asset.update({
                    where: { id: assetId },
                    data: { departmentId: newEmployee.departmentId },
                });
            }
            return created;
        });
        const populated = await this.repo.findById(newAssignment.id);
        return this.formatAssignment(populated);
    }
    async returnAsset(assetId, data) {
        // 1. Validate Asset
        const asset = await prisma_1.default.asset.findUnique({ where: { id: assetId } });
        if (!asset) {
            throw new AppError(`Asset with ID '${assetId}' not found`, 404);
        }
        // 2. Validate Active Assignment
        const activeAssignment = await this.repo.findActiveByAssetId(assetId);
        if (!activeAssignment) {
            throw new AppError(`No active assignment found for asset '${asset.assetCode}'.`, 404);
        }
        const returnDate = data.returnDate ? new Date(data.returnDate) : new Date();
        // 3. Atomic Transaction: Close assignment & update asset to AVAILABLE
        await prisma_1.default.$transaction(async (tx) => {
            await tx.assetAssignment.update({
                where: { id: activeAssignment.id },
                data: {
                    returnedDate: returnDate,
                    isCurrent: false,
                    conditionOnReturn: data.conditionOnReturn || null,
                    notes: data.remarks
                        ? activeAssignment.notes
                            ? `${activeAssignment.notes} | Return remarks: ${data.remarks}`
                            : data.remarks
                        : activeAssignment.notes,
                },
            });
            await tx.asset.update({
                where: { id: assetId },
                data: {
                    status: 'AVAILABLE',
                    ...(data.conditionOnReturn ? { condition: data.conditionOnReturn } : {}),
                },
            });
        });
        const closed = await this.repo.findById(activeAssignment.id);
        return this.formatAssignment(closed);
    }
    async getDashboardStats() {
        const stats = await this.repo.getDashboardStats();
        return {
            availableAssets: stats.availableAssets,
            assignedAssets: stats.assignedAssets,
            employeesWithAssets: stats.employeesWithAssets,
            totalAssignments: stats.totalAssignments,
            activeAssignments: stats.activeAssignments,
            returnedAssignments: stats.returnedAssignments,
            recentAssignments: stats.recentAssignments.map((a) => this.formatAssignment(a)),
        };
    }
}
exports.AssignmentService = AssignmentService;
exports.assignmentService = new AssignmentService();
//# sourceMappingURL=assignment.service.js.map