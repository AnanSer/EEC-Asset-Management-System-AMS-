"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeService = exports.StoreService = void 0;
/**
 * Store Operations Service — EEC EAMS (Phase 11E)
 * Powers Store Keeper Dashboard KPIs, Recent Store Activity feed,
 * and comprehensive Asset Movement History from existing records.
 */
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
class StoreService {
    /**
     * Retrieves live Store Dashboard KPIs & Recent Activity feed
     * All numbers are strictly derived from actual asset/request/return records.
     */
    async getDashboard() {
        // 1. Compute the four KPIs directly from database records
        const [availableAssets, assignedAssets, pendingHandovers, pendingReturns] = await Promise.all([
            prisma_1.default.asset.count({
                where: { status: client_1.AssetStatus.AVAILABLE },
            }),
            prisma_1.default.asset.count({
                where: { status: client_1.AssetStatus.ASSIGNED },
            }),
            prisma_1.default.assetRequest.count({
                where: { status: client_1.RequestStatus.APPROVED },
            }),
            prisma_1.default.assetReturnRequest.count({
                where: { status: client_1.ReturnRequestStatus.PENDING },
            }),
        ]);
        const kpis = {
            availableAssets,
            assignedAssets,
            pendingHandovers,
            pendingReturns,
        };
        // 2. Aggregate Recent Store Activity from existing records
        const [recentReturns, recentHandovers, recentAssignments] = await Promise.all([
            // A. Physically received returns
            prisma_1.default.assetReturnRequest.findMany({
                where: { status: client_1.ReturnRequestStatus.RECEIVED },
                orderBy: { receivedAt: 'desc' },
                take: 10,
                include: {
                    asset: true,
                    requester: { include: { department: true } },
                    receivedBy: {
                        select: {
                            email: true,
                            role: true,
                            employeeProfile: { select: { firstName: true, lastName: true } },
                        },
                    },
                    department: true,
                },
            }),
            // B. Fulfilled handover requests
            prisma_1.default.assetRequest.findMany({
                where: { status: client_1.RequestStatus.FULFILLED },
                orderBy: { fulfilledAt: 'desc' },
                take: 10,
                include: {
                    asset: true,
                    requester: { include: { department: true } },
                    fulfilledBy: {
                        select: {
                            email: true,
                            role: true,
                            employeeProfile: { select: { firstName: true, lastName: true } },
                        },
                    },
                    department: true,
                },
            }),
            // C. Recent assignments / transfers
            prisma_1.default.assetAssignment.findMany({
                orderBy: { assignedDate: 'desc' },
                take: 10,
                include: {
                    asset: true,
                    employee: { include: { department: true } },
                },
            }),
        ]);
        const activityItems = [];
        // Map Returns
        for (const ret of recentReturns) {
            if (!ret.asset)
                continue;
            const receiver = ret.receivedBy?.employeeProfile
                ? `${ret.receivedBy.employeeProfile.firstName} ${ret.receivedBy.employeeProfile.lastName}`
                : ret.receivedBy?.email || 'Store Keeper';
            const empName = ret.requester
                ? `${ret.requester.firstName} ${ret.requester.lastName}`
                : 'Employee';
            activityItems.push({
                id: `ret-${ret.id}`,
                type: 'RETURN',
                assetId: ret.asset.id,
                assetCode: ret.asset.assetCode,
                assetName: ret.asset.name,
                category: ret.asset.category,
                employeeName: empName,
                departmentName: ret.department?.name || 'Department',
                location: ret.returnLocation || ret.asset.location || 'Store',
                timestamp: (ret.receivedAt || ret.updatedAt).toISOString(),
                actorName: receiver,
                details: ret.conditionOnReturn
                    ? `Returned in ${ret.conditionOnReturn} condition (${ret.notes || 'No extra notes'})`
                    : ret.notes || 'Physically received into store',
            });
        }
        // Map Handovers
        for (const req of recentHandovers) {
            if (!req.asset)
                continue;
            const fulfiller = req.fulfilledBy?.employeeProfile
                ? `${req.fulfilledBy.employeeProfile.firstName} ${req.fulfilledBy.employeeProfile.lastName}`
                : req.fulfilledBy?.email || 'Store Keeper';
            const empName = req.requester
                ? `${req.requester.firstName} ${req.requester.lastName}`
                : 'Employee';
            activityItems.push({
                id: `handover-${req.id}`,
                type: 'HANDOVER',
                assetId: req.asset.id,
                assetCode: req.asset.assetCode,
                assetName: req.asset.name,
                category: req.asset.category,
                employeeName: empName,
                departmentName: req.department?.name || 'Department',
                location: req.asset.location || 'Store Handover',
                timestamp: (req.fulfilledAt || req.updatedAt).toISOString(),
                actorName: fulfiller,
                details: req.handoverNotes || `Physically handed over to ${empName}`,
            });
        }
        // Map Assignments (capturing transfers or direct assignments not already listed)
        for (const asgn of recentAssignments) {
            if (!asgn.asset)
                continue;
            const isTransfer = Boolean(asgn.notes && asgn.notes.toLowerCase().includes('transfer'));
            const empName = asgn.employee
                ? `${asgn.employee.firstName} ${asgn.employee.lastName}`
                : 'Employee';
            // Avoid duplicating handover event if matching timestamp within 2 minutes
            const exists = activityItems.some((a) => a.assetId === asgn.asset.id &&
                Math.abs(new Date(a.timestamp).getTime() - new Date(asgn.assignedDate).getTime()) < 120000);
            if (!exists) {
                activityItems.push({
                    id: `asgn-${asgn.id}`,
                    type: isTransfer ? 'TRANSFER' : 'ASSIGNMENT',
                    assetId: asgn.asset.id,
                    assetCode: asgn.asset.assetCode,
                    assetName: asgn.asset.name,
                    category: asgn.asset.category,
                    employeeName: empName,
                    departmentName: asgn.employee?.department?.name || 'Department',
                    location: asgn.asset.location || 'Assigned Custody',
                    timestamp: asgn.assignedDate.toISOString(),
                    actorName: 'Store Keeper',
                    details: asgn.notes || (isTransfer ? 'Custody transfer' : 'Direct assignment handover'),
                });
            }
        }
        // Sort by timestamp descending and take the 15 latest
        activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const recentActivity = activityItems.slice(0, 15);
        return {
            kpis,
            recentActivity,
        };
    }
    /**
     * Builds the comprehensive chronological movement history for an individual asset
     * Displayed on Asset Details: Assigned → Transferred → Returned → Assigned → ...
     */
    async getAssetMovementHistory(assetId) {
        const asset = await prisma_1.default.asset.findUnique({
            where: { id: assetId },
            include: {
                department: true,
                assignments: {
                    orderBy: { assignedDate: 'desc' },
                    include: {
                        employee: { include: { department: true } },
                    },
                },
                returnRequests: {
                    where: { status: client_1.ReturnRequestStatus.RECEIVED },
                    orderBy: { receivedAt: 'desc' },
                    include: {
                        requester: { include: { department: true } },
                        receivedBy: {
                            select: {
                                email: true,
                                employeeProfile: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
                assetRequests: {
                    where: { status: client_1.RequestStatus.FULFILLED },
                    orderBy: { fulfilledAt: 'desc' },
                    include: {
                        requester: { include: { department: true } },
                        fulfilledBy: {
                            select: {
                                email: true,
                                employeeProfile: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
                maintenanceTickets: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!asset) {
            return null;
        }
        const events = [];
        // 1. Process Assignments & Return dates
        for (const asgn of asset.assignments) {
            const isTransfer = Boolean(asgn.notes && asgn.notes.toLowerCase().includes('transfer'));
            const empName = asgn.employee
                ? `${asgn.employee.firstName} ${asgn.employee.lastName}`
                : 'Employee';
            const deptName = asgn.employee?.department?.name || 'Department';
            // If returned, add the Return event
            if (asgn.returnedDate) {
                events.push({
                    id: `asgn-ret-${asgn.id}`,
                    type: 'RETURN',
                    date: asgn.returnedDate.toISOString(),
                    title: `Returned from ${empName}`,
                    employeeName: empName,
                    departmentName: deptName,
                    location: asset.location || 'Store',
                    condition: asgn.conditionOnReturn,
                    status: 'COMPLETED',
                    details: asgn.notes || 'Custody returned to store inventory',
                });
            }
            // Add the Assignment/Transfer-in event
            events.push({
                id: `asgn-start-${asgn.id}`,
                type: isTransfer ? 'TRANSFER' : 'ASSIGNMENT',
                date: asgn.assignedDate.toISOString(),
                title: isTransfer ? `Transferred to ${empName}` : `Assigned to ${empName}`,
                employeeName: empName,
                departmentName: deptName,
                location: asset.location || 'Assigned Custody',
                condition: asgn.conditionOnAssign,
                status: asgn.isCurrent ? 'ACTIVE' : 'COMPLETED',
                details: asgn.notes || 'Handed over by Store Keeper',
            });
        }
        // 2. Process Maintenance Tickets
        for (const ticket of asset.maintenanceTickets) {
            events.push({
                id: `maint-${ticket.id}`,
                type: 'MAINTENANCE',
                date: ticket.createdAt.toISOString(),
                title: `Maintenance: ${ticket.title}`,
                actorName: ticket.assignedTechnician || 'Technician',
                status: ticket.status,
                details: ticket.description,
            });
        }
        // 3. Add initial creation event
        events.push({
            id: `asset-create-${asset.id}`,
            type: 'LOCATION_CHANGE',
            date: asset.createdAt.toISOString(),
            title: 'Registered in EAMS Inventory',
            location: asset.location || 'ICT Asset Store',
            condition: asset.condition,
            status: 'INITIAL',
            details: `Registered with asset code ${asset.assetCode}`,
        });
        // Sort all events chronologically (newest first)
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
            asset: {
                id: asset.id,
                assetCode: asset.assetCode,
                name: asset.name,
                category: asset.category,
                status: asset.status,
                location: asset.location,
            },
            events,
        };
    }
}
exports.StoreService = StoreService;
exports.storeService = new StoreService();
//# sourceMappingURL=store.service.js.map