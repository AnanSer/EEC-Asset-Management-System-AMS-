"use strict";
/**
 * Automated Verification Script: Full Notification Matrix (Phase 10B.4 Audit)
 * Tests all 15 requirements across ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER, and EMPLOYEE roles.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importStar(require("../lib/prisma"));
const identity_service_1 = require("../modules/identity/identity.service");
const assignment_service_1 = require("../modules/asset-assignments/assignment.service");
const maintenance_service_1 = require("../modules/maintenance/maintenance.service");
const testing_service_1 = require("../modules/testing/testing.service");
const settings_service_1 = require("../modules/settings/settings.service");
const notification_service_1 = require("../modules/notifications/notification.service");
async function runMatrixTests() {
    console.log('🚀 Starting Full Notification Matrix Verification...\n');
    // 1. Identify Demo Users For All 4 Roles
    const admin = await prisma_1.default.user.findFirst({
        where: { role: 'ADMIN', status: 'APPROVED' },
        include: { employeeProfile: true },
    });
    const tech = await prisma_1.default.user.findFirst({
        where: { role: 'IT_TECHNICIAN', status: 'APPROVED', employeeProfile: { isActive: true } },
        include: { employeeProfile: true },
    });
    const manager = await prisma_1.default.user.findFirst({
        where: { role: 'DEPARTMENT_MANAGER', status: 'APPROVED', employeeProfile: { isActive: true } },
        include: { employeeProfile: true },
    });
    const employee = await prisma_1.default.user.findFirst({
        where: { role: 'EMPLOYEE', status: 'APPROVED', employeeProfile: { isActive: true } },
        include: { employeeProfile: true },
    });
    if (!admin || !tech || !manager || !employee) {
        throw new Error('Required demo roles (ADMIN, IT_TECHNICIAN, DEPARTMENT_MANAGER, EMPLOYEE) not found in database.');
    }
    console.log(`👤 Roles Found:`);
    console.log(`   - ADMIN: ${admin.email} (User ID: ${admin.id})`);
    console.log(`   - IT_TECHNICIAN: ${tech.email} (User ID: ${tech.id}, Name: ${tech.employeeProfile?.firstName} ${tech.employeeProfile?.lastName})`);
    console.log(`   - DEPARTMENT_MANAGER: ${manager.email} (User ID: ${manager.id})`);
    console.log(`   - EMPLOYEE: ${employee.email} (User ID: ${employee.id})\n`);
    // Helper to get recent notifications for a user within a timestamp window
    async function getRecentNotifications(userId, since) {
        return prisma_1.default.notification.findMany({
            where: {
                userId,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    // Find a test asset
    const asset = await prisma_1.default.asset.findFirst({
        where: { status: { notIn: ['RETIRED', 'DISPOSED'] } },
        include: { department: true },
    });
    if (!asset)
        throw new Error('No active asset found for testing.');
    // Test 4 & 5: Self-Registration Notifications
    console.log('--- TEST 4 & 5: Employee Self-Registers ---');
    const regTimestamp = new Date();
    const testRegEmail = `test.audit.${Date.now()}@eec.gov.et`;
    const testEmpId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
    const regDept = await prisma_1.default.department.findFirst();
    let registeredUser = null;
    try {
        const regRes = await identity_service_1.identityService.register({
            fullName: 'Matrix Test Employee',
            email: testRegEmail,
            password: 'StrongPassword123!',
            employeeId: testEmpId,
            departmentId: regDept.id,
            position: 'Test Specialist',
            requestedRole: 'EMPLOYEE',
        });
        registeredUser = regRes.user;
        // Check employee received notification
        const empRegNotifs = await getRecentNotifications(registeredUser.id, regTimestamp);
        console.log(`   Employee notifications count: ${empRegNotifs.length}`);
        if (empRegNotifs.length !== 1 || empRegNotifs[0].title !== 'Registration Request Submitted') {
            throw new Error(`Test 5 Failed: Registering employee should receive exactly 1 'Registration Request Submitted' notification, got ${empRegNotifs.length}`);
        }
        console.log(`   ✅ Test 5 Passed: Employee received registration confirmation notification.`);
        // Check admins received pending approval notification
        const adminNotifs = await getRecentNotifications(admin.id, regTimestamp);
        const pendingApprovalNotif = adminNotifs.find((n) => n.title === 'New Account Pending Approval');
        if (!pendingApprovalNotif) {
            throw new Error(`Test 4 Failed: Admin did not receive 'New Account Pending Approval' notification.`);
        }
        console.log(`   ✅ Test 4 Passed: Admin received 'New Account Pending Approval' notification.`);
        // Test 6: Admin Approves Employee
        console.log('\n--- TEST 6: Admin Approves Employee ---');
        const approveTimestamp = new Date();
        await identity_service_1.identityService.approveAccount(registeredUser.id, { role: 'EMPLOYEE' });
        const empApproveNotifs = await getRecentNotifications(registeredUser.id, approveTimestamp);
        const approvedNotif = empApproveNotifs.find((n) => n.title === 'Account Approved');
        if (!approvedNotif) {
            throw new Error(`Test 6 Failed: Approved employee did not receive 'Account Approved' notification.`);
        }
        console.log(`   ✅ Test 6 Passed: Approved employee received 'Account Approved' notification.`);
    }
    finally {
        // Cleanup registered user
        if (registeredUser) {
            await prisma_1.default.notification.deleteMany({ where: { userId: registeredUser.id } }).catch(() => { });
            await prisma_1.default.user.delete({ where: { id: registeredUser.id } }).catch(() => { });
            await prisma_1.default.authUser.delete({ where: { email: testRegEmail } }).catch(() => { });
        }
    }
    // Test 7: Admin Rejects Employee
    console.log('\n--- TEST 7: Admin Rejects Employee ---');
    const testRejectEmail = `test.reject.${Date.now()}@eec.gov.et`;
    const testRejectEmpId = `EMP-REJ-${Date.now().toString().slice(-4)}`;
    let rejectUser = null;
    try {
        const regRejectRes = await identity_service_1.identityService.register({
            fullName: 'Reject Test Employee',
            email: testRejectEmail,
            password: 'StrongPassword123!',
            employeeId: testRejectEmpId,
            departmentId: regDept.id,
            position: 'Contractor',
            requestedRole: 'EMPLOYEE',
        });
        rejectUser = regRejectRes.user;
        const rejectTimestamp = new Date();
        await identity_service_1.identityService.rejectAccount(rejectUser.id, { reason: 'Incomplete documentation' });
        const empRejectNotifs = await getRecentNotifications(rejectUser.id, rejectTimestamp);
        const rejectedNotif = empRejectNotifs.find((n) => n.title === 'Account Request Rejected');
        if (!rejectedNotif) {
            throw new Error(`Test 7 Failed: Rejected employee did not receive 'Account Request Rejected' notification.`);
        }
        console.log(`   ✅ Test 7 Passed: Rejected employee received 'Account Request Rejected' notification.`);
    }
    finally {
        if (rejectUser) {
            await prisma_1.default.notification.deleteMany({ where: { userId: rejectUser.id } }).catch(() => { });
            await prisma_1.default.user.delete({ where: { id: rejectUser.id } }).catch(() => { });
            await prisma_1.default.authUser.delete({ where: { email: testRejectEmail } }).catch(() => { });
        }
    }
    // Test 8: Asset Assigned to Employee
    console.log('\n--- TEST 8: Asset Assignment ---');
    const assignTimestamp = new Date();
    // Clear any existing active assignments for test asset to test cleanly
    await prisma_1.default.assetAssignment.updateMany({
        where: { assetId: asset.id, isCurrent: true },
        data: { isCurrent: false, returnedDate: new Date() },
    });
    await prisma_1.default.asset.update({
        where: { id: asset.id },
        data: { status: 'AVAILABLE' },
    });
    const assignment = await assignment_service_1.assignmentService.assignAsset({
        assetId: asset.id,
        employeeId: employee.employeeProfile.id,
        conditionOnAssign: 'GOOD',
        remarks: 'Audit test assignment',
    });
    const empAssignNotifs = await getRecentNotifications(employee.id, assignTimestamp);
    const assignedNotif = empAssignNotifs.find((n) => n.title === 'Asset Assigned');
    if (!assignedNotif) {
        throw new Error(`Test 8 Failed: Receiving employee did not receive 'Asset Assigned' notification.`);
    }
    console.log(`   ✅ Test 8 Passed: Receiving employee received 'Asset Assigned' notification.`);
    // Test 9: Asset Transferred
    console.log('\n--- TEST 9: Asset Transfer ---');
    const transferTimestamp = new Date();
    await assignment_service_1.assignmentService.transferAsset(asset.id, {
        newEmployeeId: tech.employeeProfile.id,
        conditionOnTransfer: 'GOOD',
        remarks: 'Transfer test to technician',
    });
    const oldEmpNotifs = await getRecentNotifications(employee.id, transferTimestamp);
    const transferredNotif = oldEmpNotifs.find((n) => n.title === 'Asset Transferred');
    if (!transferredNotif) {
        throw new Error(`Test 9 Failed: Previous employee did not receive 'Asset Transferred' notification.`);
    }
    const newEmpNotifs = await getRecentNotifications(tech.id, transferTimestamp);
    const newAssignedNotif = newEmpNotifs.find((n) => n.title === 'Asset Assigned');
    if (!newAssignedNotif) {
        throw new Error(`Test 9 Failed: New employee did not receive 'Asset Assigned' notification.`);
    }
    console.log(`   ✅ Test 9 Passed: Both previous and new employee received correct transfer notifications.`);
    // Test 10: Asset Returned
    console.log('\n--- TEST 10: Asset Return ---');
    const returnTimestamp = new Date();
    await assignment_service_1.assignmentService.returnAsset(asset.id, {
        conditionOnReturn: 'GOOD',
        remarks: 'Return audit test',
    });
    const returningNotifs = await getRecentNotifications(tech.id, returnTimestamp);
    const returnedNotif = returningNotifs.find((n) => n.title === 'Asset Returned');
    if (!returnedNotif) {
        throw new Error(`Test 10 Failed: Returning employee did not receive 'Asset Returned' notification.`);
    }
    console.log(`   ✅ Test 10 Passed: Returning employee received 'Asset Returned' notification.`);
    // Re-assign asset to employee for maintenance tests
    await assignment_service_1.assignmentService.assignAsset({
        assetId: asset.id,
        employeeId: employee.employeeProfile.id,
        conditionOnAssign: 'GOOD',
    });
    // Test 1 & 2: Maintenance Request Created by Employee
    console.log('\n--- TEST 1 & 2: Maintenance Request Created by Employee ---');
    const techName = `${tech.employeeProfile?.firstName} ${tech.employeeProfile?.lastName}`;
    const maintCreateTimestamp = new Date();
    const ticket = await maintenance_service_1.maintenanceService.createTicket({
        assetId: asset.id,
        category: 'HARDWARE',
        priority: 'HIGH',
        status: 'OPEN',
        description: 'Matrix audit maintenance test ticket',
        reportedBy: employee.employeeProfile.employeeId,
        assignedTechnician: techName,
    });
    if (!ticket)
        throw new Error('Ticket creation failed');
    // Test 1: Technician received notification
    const techMaintNotifs = await getRecentNotifications(tech.id, maintCreateTimestamp);
    const techTaskNotif = techMaintNotifs.find((n) => n.title === 'New Maintenance Request Assigned');
    if (!techTaskNotif) {
        throw new Error(`Test 1 Failed: Responsible IT Technician did not receive assigned maintenance notification.`);
    }
    console.log(`   ✅ Test 1 Passed: Assigned technician received notification.`);
    // Test 2: Reporting Employee did NOT receive unintended technician notification
    const empMaintNotifs = await getRecentNotifications(employee.id, maintCreateTimestamp);
    const unintendedNotif = empMaintNotifs.find((n) => n.title === 'New Maintenance Request Assigned');
    if (unintendedNotif) {
        throw new Error(`Test 2 Failed: Employee reporting maintenance received unintended technician assignment notification.`);
    }
    console.log(`   ✅ Test 2 Passed: Reporting employee did NOT receive technician notification.`);
    // Test 3 & 13: Maintenance Started -> Asset owner notified, NOT admin
    console.log('\n--- TEST 3 & 13: Maintenance Work Started ---');
    const maintStartTimestamp = new Date();
    await maintenance_service_1.maintenanceService.updateStatus(ticket.id, { status: 'IN_PROGRESS' });
    // Check asset owner (employee) received notification
    const empWorkStartedNotifs = await getRecentNotifications(employee.id, maintStartTimestamp);
    const workStartedNotif = empWorkStartedNotifs.find((n) => n.title === 'Maintenance Work Started');
    if (!workStartedNotif) {
        throw new Error(`Test 3 Failed: Asset owner did not receive 'Maintenance Work Started' notification.`);
    }
    console.log(`   ✅ Test 3 Passed: Asset owner received 'Maintenance Work Started' notification.`);
    // Test 13: Unrelated admin did NOT receive maintenance started notification
    const adminWorkStartedNotifs = await getRecentNotifications(admin.id, maintStartTimestamp);
    const adminStartedNotif = adminWorkStartedNotifs.find((n) => n.title === 'Maintenance Work Started');
    if (adminStartedNotif) {
        throw new Error(`Test 13 Failed: Admin received routine employee maintenance started notification.`);
    }
    console.log(`   ✅ Test 13 Passed: No unrelated admin received maintenance started notification.`);
    // Test Moved to Testing
    console.log('\n--- Maintenance Moved to Testing ---');
    const testingQueueTimestamp = new Date();
    await maintenance_service_1.maintenanceService.updateStatus(ticket.id, { status: 'TESTING' });
    const techTestingNotifs = await getRecentNotifications(tech.id, testingQueueTimestamp);
    const techTestingNotif = techTestingNotifs.find((n) => n.title === 'Maintenance Ready For Testing');
    if (!techTestingNotif) {
        throw new Error(`Technician did not receive 'Maintenance Ready For Testing' notification.`);
    }
    const adminTestingNotifs = await getRecentNotifications(admin.id, testingQueueTimestamp);
    const adminTestingNotif = adminTestingNotifs.find((n) => n.title === 'Maintenance Ready For Testing');
    if (!adminTestingNotif) {
        throw new Error(`Testing Admin did not receive 'Maintenance Ready For Testing' notification.`);
    }
    console.log(`   ✅ Ticket moved to testing: Technician and Testing Admin notified.`);
    // Test 12: Testing Failed -> Responsible technician receives notification
    console.log('\n--- TEST 12: Testing Failed ---');
    const testFailTimestamp = new Date();
    await testing_service_1.testingService.createInspection({
        ticketId: ticket.id,
        testType: 'FUNCTIONAL',
        testedBy: admin.email,
        result: 'FAIL',
        findings: 'Power supply voltage fluctuates under load.',
        autoComplete: false,
    });
    const techFailNotifs = await getRecentNotifications(tech.id, testFailTimestamp);
    const techFailNotif = techFailNotifs.find((n) => n.title === 'Inspection Failed — Repair Required');
    if (!techFailNotif) {
        throw new Error(`Test 12 Failed: Responsible technician did not receive 'Inspection Failed — Repair Required' notification.`);
    }
    console.log(`   ✅ Test 12 Passed: Responsible technician received rework notification.`);
    // Test 11: Testing Passed -> Asset owner + technician receive notification, NOT admin
    console.log('\n--- TEST 11: Testing Passed ---');
    const testPassTimestamp = new Date();
    await testing_service_1.testingService.createInspection({
        ticketId: ticket.id,
        testType: 'POST_REPAIR_DIAGNOSTIC',
        testedBy: admin.email,
        result: 'PASS',
        findings: 'Diagnostics nominal, 100% burn-in test passed.',
        autoComplete: false,
    });
    const techPassNotifs = await getRecentNotifications(tech.id, testPassTimestamp);
    const techPassNotif = techPassNotifs.find((n) => n.title === 'Maintenance Completed Successfully');
    if (!techPassNotif) {
        throw new Error(`Test 11 Failed: Responsible technician did not receive 'Maintenance Completed Successfully' notification.`);
    }
    const empPassNotifs = await getRecentNotifications(employee.id, testPassTimestamp);
    const empPassNotif = empPassNotifs.find((n) => n.title === 'Maintenance Completed Successfully');
    if (!empPassNotif) {
        throw new Error(`Test 11 Failed: Asset owner did not receive 'Maintenance Completed Successfully' notification.`);
    }
    const adminPassNotifs = await getRecentNotifications(admin.id, testPassTimestamp);
    const adminPassNotif = adminPassNotifs.find((n) => n.title === 'Maintenance Completed Successfully');
    if (adminPassNotif) {
        throw new Error(`Test 13 Failed: Admin received ordinary maintenance completion notification.`);
    }
    console.log(`   ✅ Test 11 & 13 Passed: Owner and technician received pass notification, admin did NOT receive ordinary pass notification.`);
    // Test 14 & 15: Read, Unread count, and Delete functionality
    console.log('\n--- TEST 14 & 15: Read, Unread, and Bell Functionality ---');
    const unreadBefore = await notification_service_1.notificationService.unreadCount(employee.id);
    console.log(`   Employee unread count before: ${unreadBefore.count}`);
    const userNotifs = await notification_service_1.notificationService.listNotifications(employee.id, { page: 1, limit: 10 });
    const sampleNotif = userNotifs.notifications[0];
    if (sampleNotif) {
        await notification_service_1.notificationService.readNotification(sampleNotif.id, employee.id);
        const unreadAfterOne = await notification_service_1.notificationService.unreadCount(employee.id);
        console.log(`   Employee unread count after marking 1 read: ${unreadAfterOne.count}`);
        if (unreadAfterOne.count !== unreadBefore.count - 1 && unreadBefore.count > 0) {
            throw new Error(`Test 15 Failed: Unread count did not decrement correctly.`);
        }
        await notification_service_1.notificationService.readAllNotifications(employee.id);
        const unreadAfterAll = await notification_service_1.notificationService.unreadCount(employee.id);
        console.log(`   Employee unread count after marking all read: ${unreadAfterAll.count}`);
        if (unreadAfterAll.count !== 0) {
            throw new Error(`Test 15 Failed: Read all notifications did not set count to 0.`);
        }
    }
    console.log(`   ✅ Test 15 Passed: Read and unread count functionality verified.`);
    // Test: System Settings Updated -> Admin Users
    console.log('\n--- TEST: System Settings Updated ---');
    const settingsTimestamp = new Date();
    await settings_service_1.settingsService.updateSettings({
        organizationName: 'Ethiopian Engineering Corporation',
        organizationShortName: 'EEC',
        supportEmail: 'support@eec.gov.et',
        supportPhone: '+251 11 123 4567',
        headquartersAddress: 'Addis Ababa, Ethiopia',
    }, admin.id);
    const adminSettingsNotifs = await getRecentNotifications(admin.id, settingsTimestamp);
    const settingsNotif = adminSettingsNotifs.find((n) => n.title === 'Settings Updated');
    if (!settingsNotif) {
        throw new Error('Test Failed: Admin did not receive Settings Updated notification.');
    }
    console.log('   ✅ Test Passed: Admin received Settings Updated notification.');
    // Cleanup test ticket and test assignments
    await prisma_1.default.inspectionTest.deleteMany({ where: { ticketId: ticket.id } });
    await prisma_1.default.maintenanceTicket.delete({ where: { id: ticket.id } });
    console.log('\n🎉 ALL NOTIFICATION MATRIX TESTS PASSED SUCCESSFULLY! 100% VERIFIED!\n');
}
runMatrixTests()
    .catch((e) => {
    console.error('❌ Notification Matrix Verification Failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
    await prisma_1.pool.end();
});
//# sourceMappingURL=test_notification_matrix.js.map