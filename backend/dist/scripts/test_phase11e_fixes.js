"use strict";
/**
 * Automated Verification Script for Phase 11E Fixes:
 * - Issue 1: Store Keeper Store Operations Page & Dashboard access
 * - Issue 2: Admin Approve & Reject Asset Requests
 * - Issue 3: Inventory Category Breakdown with category & categoryLabel
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const store_controller_1 = require("../modules/store/store.controller");
const request_controller_1 = require("../modules/asset-requests/request.controller");
const asset_repository_1 = require("../modules/assets/asset.repository");
const client_1 = require("@prisma/client");
async function runFixesVerification() {
    console.log('\n======================================================================');
    console.log('  EEC EAMS – Phase 11E Fixes Verification Test Suite');
    console.log('======================================================================\n');
    let passedTests = 0;
    let totalTests = 0;
    function assert(condition, message) {
        totalTests++;
        if (!condition) {
            console.error(`   ❌ Assertion FAILED: ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
        console.log(`   ✅ ${message}`);
        passedTests++;
    }
    // -------------------------------------------------------------------------
    // MOCK EXPRESS HELPERS
    // -------------------------------------------------------------------------
    function createMockReqRes(authUser, body = {}, params = {}, query = {}) {
        const req = {
            auth: { user: authUser, session: { id: 'test-session' } },
            body,
            params,
            query,
            headers: {},
        };
        let statusCode = 200;
        let responseData = null;
        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(data) {
                responseData = data;
                return this;
            },
            getStatusCode: () => statusCode,
            getData: () => responseData,
        };
        return { req, res };
    }
    // -------------------------------------------------------------------------
    // TEST 1: ISSUE 1 — Store Keeper Access to Store Operations Dashboard
    // -------------------------------------------------------------------------
    console.log('1. TEST: Issue 1 — Store Keeper Dashboard Session Resolution...');
    // Better Auth provides session user WITHOUT role on authUser:
    const storeKeeperAuthUser = { id: 'better-auth-sk-id-1234', email: 'tylormorgan889@gmail.com' };
    const { req: skReq, res: skRes } = createMockReqRes(storeKeeperAuthUser);
    await store_controller_1.storeController.getDashboard(skReq, skRes);
    assert(skRes.getStatusCode() === 200, `Store Keeper calling /api/store/dashboard returns HTTP 200 (Got ${skRes.getStatusCode()})`);
    assert(skRes.getData()?.success === true, 'Dashboard response indicates success = true');
    assert(typeof skRes.getData()?.data?.kpis?.availableAssets === 'number', 'Response contains live availableAssets KPI');
    assert(typeof skRes.getData()?.data?.kpis?.assignedAssets === 'number', 'Response contains live assignedAssets KPI');
    assert(Array.isArray(skRes.getData()?.data?.recentActivity), 'Response contains recentActivity array');
    // Verify non-storekeeper is rejected
    const empAuthUser = { id: 'better-auth-emp-id-5678', email: 'employee.transport@eec.gov.et' };
    const { req: empReq, res: empRes } = createMockReqRes(empAuthUser);
    await store_controller_1.storeController.getDashboard(empReq, empRes);
    assert(empRes.getStatusCode() === 403, `Non-storekeeper calling /api/store/dashboard returns HTTP 403 Forbidden (Got ${empRes.getStatusCode()})`);
    // -------------------------------------------------------------------------
    // TEST 2: ISSUE 2 — Admin Approve & Reject Asset Requests
    // -------------------------------------------------------------------------
    console.log('\n2. TEST: Issue 2 — Admin Approve & Reject Request Workflows...');
    const employeeUser = await prisma_1.default.user.findUnique({
        where: { email: 'employee.transport@eec.gov.et' },
        include: { employeeProfile: true },
    });
    if (!employeeUser || !employeeUser.employeeProfile) {
        throw new Error('Test employee employee.transport@eec.gov.et not found');
    }
    const adminUser = await prisma_1.default.user.findUnique({
        where: { email: 'admin@eec.gov.et' },
    });
    if (!adminUser) {
        throw new Error('Test admin admin@eec.gov.et not found');
    }
    const initialInv = await asset_repository_1.assetRepository.getInventory();
    const initAvailable = initialInv.available;
    const initAssigned = initialInv.assigned;
    // 2A: Create a PENDING request for testing approval
    const testReq1 = await prisma_1.default.assetRequest.create({
        data: {
            requestNumber: `AR-TEST-APP-${Date.now().toString().slice(-4)}`,
            requesterId: employeeUser.employeeProfile.id,
            departmentId: employeeUser.employeeProfile.departmentId,
            category: client_1.AssetCategory.LAPTOP,
            description: 'Test Laptop for Approval verification',
            status: client_1.RequestStatus.PENDING,
        },
    });
    console.log(`   Created test request 1 for Approval: ${testReq1.requestNumber}`);
    // Admin approves via requestController.approve with Better Auth user (no role property in session)
    const adminAuthUser = { id: 'better-auth-admin-session-id', email: 'admin@eec.gov.et' };
    const { req: appReq, res: appRes } = createMockReqRes(adminAuthUser, { approvalRemarks: 'Approved by System Admin for engineering project' }, { id: testReq1.id });
    await request_controller_1.requestController.approve(appReq, appRes);
    assert(appRes.getStatusCode() === 200, `Admin calling /api/requests/:id/approve returns HTTP 200 (Got ${appRes.getStatusCode()})`);
    assert(appRes.getData()?.success === true, 'Approve response indicates success = true');
    const approvedInDb = await prisma_1.default.assetRequest.findUnique({ where: { id: testReq1.id } });
    assert(approvedInDb?.status === client_1.RequestStatus.APPROVED, `Request status changed to APPROVED (Got ${approvedInDb?.status})`);
    assert(approvedInDb?.approvedById === adminUser.id, `approvedById points to business User ID of Admin (${adminUser.id})`);
    assert(approvedInDb?.approvalRemarks === 'Approved by System Admin for engineering project', 'Approval remarks correctly recorded');
    assert(approvedInDb?.assetId === null, 'No physical asset assigned during approval');
    // Verify inventory NOT changed by approval
    const invAfterApprove = await asset_repository_1.assetRepository.getInventory();
    assert(invAfterApprove.available === initAvailable, `Inventory available unchanged after approval (${initAvailable})`);
    assert(invAfterApprove.assigned === initAssigned, `Inventory assigned unchanged after approval (${initAssigned})`);
    // 2B: Create a PENDING request for testing rejection
    const testReq2 = await prisma_1.default.assetRequest.create({
        data: {
            requestNumber: `AR-TEST-REJ-${Date.now().toString().slice(-4)}`,
            requesterId: employeeUser.employeeProfile.id,
            departmentId: employeeUser.employeeProfile.departmentId,
            category: client_1.AssetCategory.DESKTOP,
            description: 'Test Desktop for Rejection verification',
            status: client_1.RequestStatus.PENDING,
        },
    });
    console.log(`   Created test request 2 for Rejection: ${testReq2.requestNumber}`);
    // Admin rejects via requestController.reject with Better Auth user
    const { req: rejReq, res: rejRes } = createMockReqRes(adminAuthUser, { rejectionReason: 'Department quota reached for current quarter' }, { id: testReq2.id });
    await request_controller_1.requestController.reject(rejReq, rejRes);
    assert(rejRes.getStatusCode() === 200, `Admin calling /api/requests/:id/reject returns HTTP 200 (Got ${rejRes.getStatusCode()})`);
    assert(rejRes.getData()?.success === true, 'Reject response indicates success = true');
    const rejectedInDb = await prisma_1.default.assetRequest.findUnique({ where: { id: testReq2.id } });
    assert(rejectedInDb?.status === client_1.RequestStatus.REJECTED, `Request status changed to REJECTED (Got ${rejectedInDb?.status})`);
    assert(rejectedInDb?.rejectedById === adminUser.id, `rejectedById points to business User ID of Admin (${adminUser.id})`);
    assert(rejectedInDb?.rejectionReason === 'Department quota reached for current quarter', 'Rejection reason correctly recorded');
    // Verify inventory NOT changed by rejection
    const invAfterReject = await asset_repository_1.assetRepository.getInventory();
    assert(invAfterReject.available === initAvailable, `Inventory available unchanged after rejection (${initAvailable})`);
    assert(invAfterReject.assigned === initAssigned, `Inventory assigned unchanged after rejection (${initAssigned})`);
    // -------------------------------------------------------------------------
    // TEST 3: ISSUE 3 — Inventory Category Breakdown
    // -------------------------------------------------------------------------
    console.log('\n3. TEST: Issue 3 — Inventory Category Breakdown Payload...');
    const inventorySummary = await asset_repository_1.assetRepository.getInventory();
    assert(Boolean(inventorySummary.byCategory), 'inventory.byCategory exists in response');
    const categories = Object.keys(inventorySummary.byCategory);
    assert(categories.length > 0, `byCategory contains categories (Count: ${categories.length})`);
    for (const catKey of categories) {
        const item = inventorySummary.byCategory[catKey];
        assert(Boolean(item.category), `Category item for ${catKey} contains .category property (${item.category})`);
        assert(Boolean(item.categoryLabel), `Category item for ${catKey} contains .categoryLabel property (${item.categoryLabel})`);
        assert(item.total === item.available + item.assigned + item.maintenance + item.testing + item.retired, `Category ${catKey} arithmetic consistent: total (${item.total}) === sum of sub-statuses`);
    }
    // Cleanup test requests
    console.log('\n4. Cleaning up test requests...');
    await prisma_1.default.assetRequest.deleteMany({
        where: { id: { in: [testReq1.id, testReq2.id] } },
    });
    console.log('   Cleaned up test requests successfully.');
    console.log('\n======================================================================');
    console.log(`  Fixes Verification Complete: ${passedTests}/${totalTests} Tests Passed!`);
    console.log('======================================================================\n');
}
runFixesVerification()
    .catch((err) => {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
})
    .finally(() => prisma_1.default.$disconnect());
//# sourceMappingURL=test_phase11e_fixes.js.map