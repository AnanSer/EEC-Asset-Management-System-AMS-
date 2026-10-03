/**
 * Comprehensive Automated Verification Script for Phase 11C:
 * Asset Request, Admin Approval & Store Keeper Handover
 */
import prisma from '../lib/prisma';
import { requestService } from '../modules/asset-requests/request.service';
import { assetService } from '../modules/assets/asset.service';
import { ROLES } from '../constants/roles';
import { RequestStatus, AssetStatus, AssetCategory } from '@prisma/client';

async function runPhase11CWorkflowVerification() {
  console.log('\n======================================================================');
  console.log('  EEC EAMS – Phase 11C: Asset Request & Handover End-to-End Test Suite');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (!condition) {
      console.error(`   ❌ Assertion FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`   ✅ ${message}`);
    passedTests++;
  }

  // 1. Fetch seed users
  console.log('1. Loading Test Users for Roles...');
  const users = await prisma.user.findMany({
    include: { employeeProfile: { include: { department: true } } },
  });

  const employee = users.find((u) => u.role === ROLES.EMPLOYEE && u.employeeProfile);
  const admin = users.find((u) => u.role === ROLES.ADMIN);
  const storekeeper = users.find((u) => u.role === ROLES.STORE_KEEPER);
  const manager = users.find((u) => u.role === ROLES.DEPARTMENT_MANAGER && u.employeeProfile);

  if (!employee || !admin || !storekeeper || !manager) {
    throw new Error('Missing one or more required test users (Employee, Admin, Store Keeper, Manager)');
  }

  console.log(`   Employee: ${employee.email} (${employee.employeeProfile?.employeeId})`);
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Store Keeper: ${storekeeper.email}`);
  console.log(`   Department Manager: ${manager.email}`);

  // Ensure department
  const departmentId = employee.employeeProfile!.departmentId;

  // 2. Prepare clean test assets
  console.log('\n2. Preparing Clean Test Assets in Inventory...');
  const timestamp = Date.now().toString().slice(-4);
  const laptopCode = `TEST-LAP-${timestamp}`;
  const desktopCode = `TEST-DESK-${timestamp}`;

  const testLaptop = await prisma.asset.create({
    data: {
      assetCode: laptopCode,
      name: `Test ThinkPad ${timestamp}`,
      category: AssetCategory.LAPTOP,
      brand: 'Lenovo',
      model: 'T14 Gen 3',
      serialNumber: `SN-LAP-${timestamp}`,
      status: AssetStatus.AVAILABLE,
      condition: 'EXCELLENT',
      departmentId,
    },
  });

  const testDesktop = await prisma.asset.create({
    data: {
      assetCode: desktopCode,
      name: `Test Desktop ${timestamp}`,
      category: AssetCategory.DESKTOP,
      brand: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: `SN-DSK-${timestamp}`,
      status: AssetStatus.AVAILABLE,
      condition: 'GOOD',
      departmentId,
    },
  });

  console.log(`   Created test laptop: ${testLaptop.assetCode} (Status: ${testLaptop.status})`);
  console.log(`   Created test desktop: ${testDesktop.assetCode} (Status: ${testDesktop.status})`);

  // Snapshot initial inventory counts
  const initialInventory = await assetService.getInventory();
  console.log(`   Initial Inventory: Total=${initialInventory.total}, Available=${initialInventory.available}, Assigned=${initialInventory.assigned}`);

  try {
    // -----------------------------------------------------------------------
    // TEST 1: Employee Submits Asset Request (PENDING)
    // -----------------------------------------------------------------------
    console.log('\n3. TEST 1: Employee Submits Asset Request (PENDING)...');
    const createdReq = await requestService.createRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      {
        category: 'LAPTOP',
        description: 'Need portable workstation for on-site client audit',
        notes: 'Priority requirement for Q4',
      }
    );

    assert(createdReq.status === RequestStatus.PENDING, 'Request status is PENDING');
    assert(/^AR-\d{4}-\d{4}$/.test(createdReq.requestNumber), `Request number format matches AR-YYYY-XXXX (${createdReq.requestNumber})`);
    assert(createdReq.requesterId === employee.employeeProfile!.id, 'Requester ID linked to employee profile');
    assert(createdReq.assetId === null, 'No asset is assigned upon request submission');
    assert(createdReq.approvedById === null, 'ApprovedBy is null');
    assert(createdReq.fulfilledById === null, 'FulfilledBy is null');

    // Verify inventory counts untouched
    const invAfterReq = await assetService.getInventory();
    assert(invAfterReq.available === initialInventory.available, 'Store Available count NOT changed after request submission');
    assert(invAfterReq.assigned === initialInventory.assigned, 'Store Assigned count NOT changed after request submission');

    // -----------------------------------------------------------------------
    // TEST 2: Admin Approves Request (APPROVED)
    // -----------------------------------------------------------------------
    console.log('\n4. TEST 2: Admin Approves Request (APPROVED)...');
    const approvedReq = await requestService.approveRequest(
      { id: admin.id, email: admin.email, role: ROLES.ADMIN },
      createdReq.id,
      { approvalRemarks: 'Approved as per IT asset allocation policy' }
    );

    assert(approvedReq.status === RequestStatus.APPROVED, 'Request status transitioned to APPROVED');
    assert(approvedReq.approvedById === admin.id, 'ApprovedBy is set to Admin user ID');
    assert(approvedReq.approvedAt !== null, 'ApprovedAt timestamp is recorded');
    assert(approvedReq.approvalRemarks === 'Approved as per IT asset allocation policy', 'Approval remarks stored');
    assert(approvedReq.assetId === null, 'NO asset is assigned or reserved during Admin approval');

    // Verify inventory counts STILL untouched!
    const invAfterApprove = await assetService.getInventory();
    assert(invAfterApprove.available === initialInventory.available, 'Store Available count NOT changed after Admin approval');
    assert(invAfterApprove.assigned === initialInventory.assigned, 'Store Assigned count NOT changed after Admin approval');

    // -----------------------------------------------------------------------
    // TEST 3: Store Keeper Confirms Physical Handover (FULFILLED)
    // -----------------------------------------------------------------------
    console.log('\n5. TEST 3: Store Keeper Confirms Physical Handover (FULFILLED)...');
    const fulfilledReq = await requestService.fulfillRequest(
      { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
      approvedReq.id,
      {
        assetId: testLaptop.id,
        conditionOnAssign: 'EXCELLENT',
        handoverNotes: 'Device handed over with charger, bag, and security tag verified',
      }
    );

    assert(fulfilledReq.status === RequestStatus.FULFILLED, 'Request status transitioned to FULFILLED');
    assert(fulfilledReq.assetId === testLaptop.id, 'Request is linked to chosen physical asset');
    assert(fulfilledReq.fulfilledById === storekeeper.id, 'FulfilledBy is set to Store Keeper');
    assert(fulfilledReq.fulfilledAt !== null, 'FulfilledAt timestamp is recorded');
    assert(Boolean(fulfilledReq.handoverNotes?.includes('Device handed over')), 'Handover notes recorded');

    // Verify Asset status changed to ASSIGNED
    const updatedAsset = await prisma.asset.findUnique({ where: { id: testLaptop.id } });
    assert(updatedAsset?.status === AssetStatus.ASSIGNED, 'Physical asset status transitioned from AVAILABLE to ASSIGNED');

    // Verify AssetAssignment record created
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: {
        assetId: testLaptop.id,
        employeeId: employee.employeeProfile!.id,
        isCurrent: true,
      },
    });
    assert(!!activeAssignment, 'Active AssetAssignment created via existing assignment system');
    assert(activeAssignment?.conditionOnAssign === 'EXCELLENT', 'Condition on assign matches handover condition');

    // Verify inventory counts automatically updated!
    const invAfterFulfill = await assetService.getInventory();
    assert(invAfterFulfill.available === initialInventory.available - 1, 'Store Available count decreased by 1');
    assert(invAfterFulfill.assigned === initialInventory.assigned + 1, 'Store Assigned count increased by 1');

    // -----------------------------------------------------------------------
    // TEST 4: Admin Rejection Workflow
    // -----------------------------------------------------------------------
    console.log('\n6. TEST 4: Rejection Workflow...');
    const reqToReject = await requestService.createRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      {
        category: 'DESKTOP',
        description: 'Desktop workstation request',
      }
    );

    const rejectedReq = await requestService.rejectRequest(
      { id: admin.id, email: admin.email, role: ROLES.ADMIN },
      reqToReject.id,
      { rejectionReason: 'Existing workstation is sufficient for current role' }
    );

    assert(rejectedReq.status === RequestStatus.REJECTED, 'Request status transitioned to REJECTED');
    assert(rejectedReq.rejectedById === admin.id, 'RejectedBy set to Admin');
    assert(rejectedReq.rejectionReason === 'Existing workstation is sufficient for current role', 'Rejection reason recorded');
    assert(rejectedReq.assetId === null, 'No asset associated with rejected request');

    // Verify inventory counts unaffected by rejection
    const invAfterReject = await assetService.getInventory();
    assert(invAfterReject.available === invAfterFulfill.available, 'Inventory unchanged by rejection');

    // -----------------------------------------------------------------------
    // TEST 5: RBAC Security & Unauthorized Access Checks
    // -----------------------------------------------------------------------
    console.log('\n7. TEST 5: RBAC Security & Unauthorized Access Checks...');
    const unauthReq = await requestService.createRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      { category: 'MONITOR', description: 'Monitor request for RBAC tests' }
    );

    // 5a. Employee attempts to approve -> 403 Forbidden
    let empApproveBlocked = false;
    try {
      await requestService.approveRequest(
        { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
        unauthReq.id,
        { approvalRemarks: 'Self approval' }
      );
    } catch (err: any) {
      if (err.statusCode === 403) empApproveBlocked = true;
    }
    assert(empApproveBlocked, 'Employee cannot approve requests (403 Forbidden)');

    // 5b. Employee attempts to fulfill -> 403 Forbidden
    let empFulfillBlocked = false;
    try {
      await requestService.fulfillRequest(
        { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
        unauthReq.id,
        { assetId: testDesktop.id }
      );
    } catch (err: any) {
      if (err.statusCode === 403) empFulfillBlocked = true;
    }
    assert(empFulfillBlocked, 'Employee cannot fulfill handover (403 Forbidden)');

    // 5c. Store Keeper attempts to approve -> 403 Forbidden
    let skApproveBlocked = false;
    try {
      await requestService.approveRequest(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        unauthReq.id,
        { approvalRemarks: 'Store keeper approval' }
      );
    } catch (err: any) {
      if (err.statusCode === 403) skApproveBlocked = true;
    }
    assert(skApproveBlocked, 'Store Keeper cannot approve requests (403 Forbidden)');

    // -----------------------------------------------------------------------
    // TEST 6: Concurrency, Collision & Category Match Guards
    // -----------------------------------------------------------------------
    console.log('\n8. TEST 6: Concurrency & Category Guards...');
    // Approve unauthReq
    const approvedForTest6 = await requestService.approveRequest(
      { id: admin.id, email: admin.email, role: ROLES.ADMIN },
      unauthReq.id,
      { approvalRemarks: 'Approved for test 6' }
    );

    // 6a. Attempt to assign an asset that is already ASSIGNED (testLaptop is now ASSIGNED)
    let collisionBlocked = false;
    try {
      await requestService.fulfillRequest(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        approvedForTest6.id,
        { assetId: testLaptop.id }
      );
    } catch (err: any) {
      if (err.statusCode === 409) collisionBlocked = true;
    }
    assert(collisionBlocked, 'Fulfilling with already ASSIGNED asset is rejected (409 Conflict)');

    // 6b. Attempt to assign wrong category (request is MONITOR, testDesktop is DESKTOP)
    let categoryMismatchBlocked = false;
    try {
      await requestService.fulfillRequest(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        approvedForTest6.id,
        { assetId: testDesktop.id }
      );
    } catch (err: any) {
      if (err.statusCode === 422) categoryMismatchBlocked = true;
    }
    assert(categoryMismatchBlocked, 'Fulfilling with mismatched category is rejected (422 Unprocessable Entity)');

    // -----------------------------------------------------------------------
    // TEST 7: Request Cancellation Lifecycle
    // -----------------------------------------------------------------------
    console.log('\n9. TEST 7: Request Cancellation Lifecycle...');
    const cancelTestReq = await requestService.createRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      { category: 'UPS', description: 'UPS unit requested' }
    );

    // Requester cancels pending request
    const cancelledReq = await requestService.cancelRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      cancelTestReq.id
    );
    assert(cancelledReq.status === RequestStatus.CANCELLED, 'Requester successfully cancelled their PENDING request');

    // Attempting to cancel an already FULFILLED request is rejected
    let cancelFulfilledBlocked = false;
    try {
      await requestService.cancelRequest(
        { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
        fulfilledReq.id
      );
    } catch (err: any) {
      if (err.statusCode === 422) cancelFulfilledBlocked = true;
    }
    assert(cancelFulfilledBlocked, 'Cannot cancel an already FULFILLED request (422 Unprocessable Entity)');

    console.log('\n======================================================================');
    console.log(`  🎉 ALL PHASE 11C WORKFLOW TESTS PASSED (${passedTests}/${totalTests})`);
    console.log('======================================================================\n');
  } finally {
    // Clean up test data
    console.log('10. Cleaning up test assets and requests...');
    await prisma.assetAssignment.deleteMany({
      where: { assetId: { in: [testLaptop.id, testDesktop.id] } },
    });
    await prisma.assetRequest.deleteMany({
      where: {
        description: {
          in: [
            'Need portable workstation for on-site client audit',
            'Desktop workstation request',
            'Monitor request for RBAC tests',
            'UPS unit requested',
          ],
        },
      },
    });
    await prisma.asset.deleteMany({
      where: { id: { in: [testLaptop.id, testDesktop.id] } },
    });
    console.log('   ✅ Cleanup complete.\n');
  }
}

runPhase11CWorkflowVerification()
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
