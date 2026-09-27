"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingService = exports.TestingService = exports.AppError = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const testing_repository_1 = require("./testing.repository");
const client_1 = require("@prisma/client");
const notifications_1 = require("../notifications");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class TestingService {
    constructor(repo = testing_repository_1.testingRepository) {
        this.repo = repo;
    }
    formatInspection(test) {
        if (!test)
            return null;
        return {
            id: test.id,
            ticketId: test.ticketId,
            testedBy: test.testedBy,
            testDate: test.testDate,
            testType: test.testType,
            status: test.status,
            passed: Boolean(test.passed),
            result: test.passed ? 'PASS' : 'FAIL',
            notes: test.findings,
            findings: test.findings,
            recommendedAction: test.recommendations,
            recommendations: test.recommendations,
            createdAt: test.createdAt,
            updatedAt: test.updatedAt,
            ticket: test.ticket
                ? {
                    id: test.ticket.id,
                    ticketNumber: test.ticket.ticketNumber,
                    title: test.ticket.title,
                    category: test.ticket.title,
                    status: test.ticket.status,
                    priority: test.ticket.priority,
                    asset: test.ticket.asset,
                }
                : null,
        };
    }
    async getInspectionsByTicket(ticketId) {
        const ticket = await prisma_1.default.maintenanceTicket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket) {
            throw new AppError(`Maintenance ticket with ID '${ticketId}' not found`, 404);
        }
        const inspections = await this.repo.findByTicketId(ticketId);
        return inspections.map((i) => this.formatInspection(i));
    }
    async createInspection(data) {
        const ticket = await prisma_1.default.maintenanceTicket.findUnique({
            where: { id: data.ticketId },
            include: {
                asset: {
                    include: {
                        assignments: { where: { isCurrent: true } },
                    },
                },
            },
        });
        if (!ticket) {
            throw new AppError(`Maintenance ticket with ID '${data.ticketId}' not found`, 404);
        }
        const passed = data.result === 'PASS';
        const testDate = data.testDate ? new Date(data.testDate) : new Date();
        const status = passed ? client_1.InspectionStatus.PASSED : client_1.InspectionStatus.FAILED;
        const created = await prisma_1.default.$transaction(async (tx) => {
            // 1. Record Inspection Test
            const inspection = await tx.inspectionTest.create({
                data: {
                    ticketId: data.ticketId,
                    testedBy: data.testedBy,
                    testDate,
                    status,
                    findings: data.findings || null,
                    recommendations: data.recommendations || null,
                    passed,
                    testType: data.testType || 'QUALITY_AND_FUNCTIONALITY',
                },
            });
            // 2. Apply Business Workflow Rules
            if (!passed) {
                // FAIL rule: Ticket returns to IN_PROGRESS, asset remains/reverts to MAINTENANCE
                await tx.maintenanceTicket.update({
                    where: { id: data.ticketId },
                    data: {
                        status: 'IN_PROGRESS',
                        resolutionNotes: data.recommendations
                            ? `Inspection FAILED: ${data.findings || ''} | Recommended Action: ${data.recommendations}`
                            : data.findings
                                ? `Inspection FAILED: ${data.findings}`
                                : ticket.resolutionNotes,
                    },
                });
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: { status: 'MAINTENANCE' },
                });
            }
            else {
                // PASS rule: Ticket moves to COMPLETED and asset status is restored
                if (data.autoComplete !== false) {
                    const now = new Date();
                    const activeAssignment = await tx.assetAssignment.findFirst({
                        where: { assetId: ticket.assetId, isCurrent: true },
                    });
                    await tx.maintenanceTicket.update({
                        where: { id: data.ticketId },
                        data: {
                            status: 'COMPLETED',
                            completedDate: now,
                            resolutionNotes: data.findings
                                ? `Passed inspection: ${data.findings}`
                                : ticket.resolutionNotes,
                        },
                    });
                    await tx.asset.update({
                        where: { id: ticket.assetId },
                        data: {
                            status: activeAssignment ? 'ASSIGNED' : 'AVAILABLE',
                        },
                    });
                }
                else {
                    // Keep ticket in TESTING so completion can be confirmed, or update notes
                    if (ticket.status !== 'TESTING') {
                        await tx.maintenanceTicket.update({
                            where: { id: data.ticketId },
                            data: { status: 'TESTING' },
                        });
                        await tx.asset.update({
                            where: { id: ticket.assetId },
                            data: { status: 'TESTING' },
                        });
                    }
                }
            }
            return inspection;
        });
        const populated = await this.repo.findById(created.id);
        // In-app Notifications: Inspection Results (Phase 10B.2)
        if (passed) {
            // Event 11: Inspection PASS -> notify asset owner, admin users, assigned technician
            const passNotifications = [];
            const techUserId = await (0, notifications_1.getTechnicianUserId)(ticket.assignedTechnician);
            if (techUserId) {
                passNotifications.push({
                    userId: techUserId,
                    type: client_1.NotificationType.SUCCESS,
                    title: 'Maintenance Completed Successfully',
                    message: `Maintenance and quality inspection passed for ${ticket.asset?.name || 'asset'} (${ticket.asset?.assetCode || ''}) under ticket ${ticket.ticketNumber}. Equipment is ready.`,
                    link: '/my-maintenance',
                });
            }
            let ownerUserId = await (0, notifications_1.getAssetOwnerUserId)(ticket.assetId);
            if (!ownerUserId && ticket.reportedBy) {
                const reporterUser = await prisma_1.default.user.findFirst({
                    where: {
                        OR: [
                            { email: ticket.reportedBy },
                            { employeeProfile: { employeeId: ticket.reportedBy } },
                        ],
                    },
                    select: { id: true },
                });
                ownerUserId = reporterUser?.id || null;
            }
            if (ownerUserId && ownerUserId !== techUserId) {
                passNotifications.push({
                    userId: ownerUserId,
                    type: client_1.NotificationType.SUCCESS,
                    title: 'Maintenance Completed Successfully',
                    message: `Maintenance and quality inspection passed for ${ticket.asset?.name || 'asset'} (${ticket.asset?.assetCode || ''}) under ticket ${ticket.ticketNumber}. Equipment is ready.`,
                    link: '/my-maintenance',
                });
            }
            const adminUserIds = await (0, notifications_1.getAdminUserIds)();
            for (const adminId of adminUserIds) {
                if (adminId !== techUserId && adminId !== ownerUserId) {
                    passNotifications.push({
                        userId: adminId,
                        type: client_1.NotificationType.SUCCESS,
                        title: 'Maintenance Completed Successfully',
                        message: `Maintenance and quality inspection passed for ${ticket.asset?.name || 'asset'} (${ticket.asset?.assetCode || ''}) under ticket ${ticket.ticketNumber}. Equipment is ready.`,
                        link: '/my-maintenance',
                    });
                }
            }
            await (0, notifications_1.safeNotifyUsers)(passNotifications);
        }
        else {
            // Event 12: Inspection FAIL -> notify assigned technician
            const techUserId = await (0, notifications_1.getTechnicianUserId)(ticket.assignedTechnician);
            if (techUserId) {
                await (0, notifications_1.safeNotifyUser)({
                    userId: techUserId,
                    type: client_1.NotificationType.WARNING,
                    title: 'Inspection Failed — Repair Required',
                    message: `Inspection failed for ${ticket.asset?.name || 'asset'} (${ticket.asset?.assetCode || ''}) under ticket ${ticket.ticketNumber}. Rework is required.`,
                    link: '/my-maintenance',
                });
            }
        }
        return this.formatInspection(populated);
    }
    async updateInspection(id, data) {
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new AppError(`Inspection test with ID '${id}' not found`, 404);
        }
        const passed = data.result ? data.result === 'PASS' : existing.passed;
        const status = passed ? client_1.InspectionStatus.PASSED : client_1.InspectionStatus.FAILED;
        const updated = await this.repo.update(id, {
            ...(data.testedBy ? { testedBy: data.testedBy } : {}),
            ...(data.testDate ? { testDate: new Date(data.testDate) } : {}),
            ...(data.testType ? { testType: data.testType } : {}),
            ...(data.findings !== undefined ? { findings: data.findings } : {}),
            ...(data.recommendations !== undefined ? { recommendations: data.recommendations } : {}),
            ...(data.result ? { passed, status } : {}),
        });
        return this.formatInspection(updated);
    }
}
exports.TestingService = TestingService;
exports.testingService = new TestingService();
//# sourceMappingURL=testing.service.js.map