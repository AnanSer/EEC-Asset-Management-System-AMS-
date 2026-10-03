/**
 * Comprehensive Automated Verification Script for Phase 11D:
 * Return Request & Walk-in Asset Return Workflow
 */
import prisma from '../lib/prisma';
import { returnService, AppError } from '../modules/asset-returns/return.service';
import { assetService } from '../modules/assets/asset.service';
import { ROLES } from '../constants/roles';
import { ReturnRequestStatus, AssetStatus, AssetCategory, AssetCondition } from '@prisma/client';

async function runPhase11DReturnsWorkflowVerification() {
  console.log('\n======================================================================');
  console.log('  EEC EAMS – Phase 11D: Asset Return & Store Receiving Test Suite');
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
  const employee2 = users.find(
    (u) => u.role === ROLES.EMPLOYEE && u.employeeProfile && u.id !== employee?.id
  );
  const admin = users.find((u) => u.role === ROLES.ADMIN);
  const storekeeper = users.find((u) => u.role === ROLES.STORE_KEEPER);
  const manager = users.find((u) => u.role === ROLES.DEPARTMENT_MANAGER && u.employeeProfile);
  const technician = users.find((u) => u.role === ROLES.IT_TECHNICIAN);

  if (!employee || !admin || !storekeeper || !manager) {
    throw new Error('Missing one or more required test users (Employee, Admin, Store Keeper, Manager)');
  }

  console.log(`   Employee 1: ${employee.email} (${employee.employeeProfile?.employeeId})`);
  if (employee2) {
    console.log(`   Employee 2: ${employee2.email} (${employee2.employeeProfile?.employeeId})`);
  }
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Store Keeper: ${storekeeper.email}`);
  console.log(`   Department Manager: ${manager.email}`);
  if (technician) {
    console.log(`   IT Technician: ${technician.email}`);
  }

  const departmentId = employee.employeeProfile!.departmentId;
  const timestamp = Date.now().toString().slice(-4);

  // 2. Prepare test assets & assign to employee
  console.log('\n2. Preparing Test Assets and Active Assignments...');

  const laptopCode = `RET-LAP-${timestamp}`;
  const desktopCode = `RET-DSK-${timestamp}`;
  const duplicateTestCode = `RET-DUP-${timestamp}`;
  const cancelTestCode = `RET-CAN-${timestamp}`;

  // Helper to create an assigned asset with an active assignment
  async function createAssignedAsset(code: string, name: string, assignedToUserId: string) {
    const targetUser = users.find((u) => u.id === assignedToUserId);
    const empProfile = targetUser!.employeeProfile!;

    const asset = await prisma.asset.create({
      data: {
        assetCode: code,
        name,
        category: AssetCategory.LAPTOP,
        brand: 'HP',
        model: 'EliteBook 840',
        serialNumber: `SN-${code}`,
        status: AssetStatus.ASSIGNED,
        condition: AssetCondition.GOOD,
        location: 'Employee Desk - Room 302',
        departmentId: empProfile.departmentId,
      },
    });

    const assignment = await prisma.assetAssignment.create({
      data: {
        assetId: asset.id,
        employeeId: empProfile.id,
        assignedDate: new Date(),
        conditionOnAssign: AssetCondition.GOOD,
        isCurrent: true,
        notes: 'Handed over for daily work',
      },
    });

    return { asset, assignment };
  }

  const { asset: testAsset1 } = await createAssignedAsset(laptopCode, `Test Laptop ${timestamp}`, employee.id);
  const { asset: testAsset2 } = await createAssignedAsset(desktopCode, `Test Desktop ${timestamp}`, employee.id);
  const { asset: testAsset3 } = await createAssignedAsset(duplicateTestCode, `Test Dup ${timestamp}`, employee.id);
  const { asset: testAsset4 } = await createAssignedAsset(cancelTestCode, `Test Cancel ${timestamp}`, employee.id);

  console.log(`   Created assigned asset 1: ${testAsset1.assetCode}`);
  console.log(`   Created assigned asset 2: ${testAsset2.assetCode}`);

  try {
    // -----------------------------------------------------------------------
    // TEST 1: Employee Creates Return Request (PENDING)
    // -----------------------------------------------------------------------
    console.log('\n3. TEST 1: Employee Submits Return Request (PENDING)...');

    const invBeforeReq = await assetService.getInventory();
    console.log(`   Inventory Before: Available=${invBeforeReq.available}, Assigned=${invBeforeReq.assigned}`);

    const returnReq = await returnService.createReturnRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      {
        assetId: testAsset1.id,
        reason: 'Project completed; returning laptop to IT store',
        notes: 'Includes charger and laptop bag',
      }
    );

    assert(returnReq.status === ReturnRequestStatus.PENDING, 'Return request status is PENDING');
    assert(returnReq.assetId === testAsset1.id, 'Return request references correct asset');
    assert(returnReq.requesterId === employee.employeeProfile!.id, 'Requester is current employee');

    // Verify Asset status is STILL ASSIGNED
    const assetAfterReq = await prisma.asset.findUnique({ where: { id: testAsset1.id } });
    assert(assetAfterReq?.status === AssetStatus.ASSIGNED, 'Asset status is STILL ASSIGNED (not changed by pending request)');

    // Verify Assignment is STILL active
    const activeAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId: testAsset1.id, isCurrent: true },
    });
    assert(activeAssignment !== null, 'Active assignment remains intact');
    assert(activeAssignment?.returnedDate === null, 'Assignment returnedDate is still null');

    // Verify Inventory is UNCHANGED
    const invAfterReq = await assetService.getInventory();
    assert(invAfterReq.available === invBeforeReq.available, 'Inventory Available count is UNCHANGED');
    assert(invAfterReq.assigned === invBeforeReq.assigned, 'Inventory Assigned count is UNCHANGED');

    // -----------------------------------------------------------------------
    // TEST 2: Store Keeper Physically Receives & Inspects Asset (Path A)
    // -----------------------------------------------------------------------
    console.log('\n4. TEST 2: Store Keeper Receives & Inspects Asset (Path A)...');

    const invBeforeReceive = await assetService.getInventory();

    const receivedReturn = await returnService.receiveReturn(
      { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
      returnReq.id,
      {
        conditionOnReturn: AssetCondition.GOOD,
        returnLocation: 'ICT Asset Store',
        notes: 'Inspected physically. Charger and bag accounted for. Working condition verified.',
      }
    );

    assert(receivedReturn.status === ReturnRequestStatus.RECEIVED, 'Return request status changed to RECEIVED');
    assert(receivedReturn.receivedById === storekeeper.id, 'Received by recorded as Store Keeper user ID');
    assert(receivedReturn.conditionOnReturn === AssetCondition.GOOD, 'conditionOnReturn recorded');
    assert(receivedReturn.returnLocation === 'ICT Asset Store', 'returnLocation recorded');

    // Verify Asset status changed from ASSIGNED -> AVAILABLE
    const assetAfterReceive = await prisma.asset.findUnique({ where: { id: testAsset1.id } });
    assert(assetAfterReceive?.status === AssetStatus.AVAILABLE, 'Asset status changed to AVAILABLE');
    assert(assetAfterReceive?.location === 'ICT Asset Store', 'Asset physical location updated to ICT Asset Store');

    // Verify active assignment was closed
    const closedAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId: testAsset1.id, returnedDate: { not: null } },
    });
    assert(closedAssignment !== null, 'Assignment record was closed');
    assert(closedAssignment?.isCurrent === false, 'Assignment isCurrent set to false');
    assert(closedAssignment?.conditionOnReturn === AssetCondition.GOOD, 'Assignment conditionOnReturn recorded');

    // Verify no currently active assignment exists for this asset
    const remainingCurrent = await prisma.assetAssignment.findFirst({
      where: { assetId: testAsset1.id, isCurrent: true },
    });
    assert(remainingCurrent === null, 'No remaining active assignment exists for asset');

    // Verify Inventory counts automatically updated
    const invAfterReceive = await assetService.getInventory();
    assert(
      invAfterReceive.available === invBeforeReceive.available + 1,
      `Inventory Available incremented by 1 (${invBeforeReceive.available} -> ${invAfterReceive.available})`
    );
    assert(
      invAfterReceive.assigned === invBeforeReceive.assigned - 1,
      `Inventory Assigned decremented by 1 (${invBeforeReceive.assigned} -> ${invAfterReceive.assigned})`
    );

    // -----------------------------------------------------------------------
    // TEST 3: Walk-in / Direct Return by Store Keeper (Path B)
    // -----------------------------------------------------------------------
    console.log('\n5. TEST 3: Walk-in / Direct Return (Path B)...');

    const invBeforeWalkIn = await assetService.getInventory();

    const walkInResult = await returnService.receiveWalkInReturn(
      { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
      {
        assetId: testAsset2.id,
        conditionOnReturn: AssetCondition.EXCELLENT,
        returnLocation: 'Main Warehouse - Shelf B3',
        notes: 'Direct walk-in return by employee. Unit in excellent condition.',
      }
    );

    assert(walkInResult.status === ReturnRequestStatus.RECEIVED, 'Walk-in return record created as RECEIVED');
    assert(walkInResult.receivedById === storekeeper.id, 'Walk-in received by Store Keeper');

    // Verify Asset status is AVAILABLE
    const assetAfterWalkIn = await prisma.asset.findUnique({ where: { id: testAsset2.id } });
    assert(assetAfterWalkIn?.status === AssetStatus.AVAILABLE, 'Walk-in asset status changed to AVAILABLE');
    assert(assetAfterWalkIn?.location === 'Main Warehouse - Shelf B3', 'Walk-in asset location updated');

    // Verify assignment closed
    const closedWalkInAssignment = await prisma.assetAssignment.findFirst({
      where: { assetId: testAsset2.id, isCurrent: false },
    });
    assert(closedWalkInAssignment !== null, 'Walk-in assignment closed successfully');
    assert(closedWalkInAssignment?.conditionOnReturn === AssetCondition.EXCELLENT, 'Walk-in conditionOnReturn recorded');

    // Verify Inventory counts automatically updated
    const invAfterWalkIn = await assetService.getInventory();
    assert(
      invAfterWalkIn.available === invBeforeWalkIn.available + 1,
      `Inventory Available incremented by 1 for walk-in (${invBeforeWalkIn.available} -> ${invAfterWalkIn.available})`
    );
    assert(
      invAfterWalkIn.assigned === invBeforeWalkIn.assigned - 1,
      `Inventory Assigned decremented by 1 for walk-in (${invBeforeWalkIn.assigned} -> ${invAfterWalkIn.assigned})`
    );

    // -----------------------------------------------------------------------
    // TEST 4: Unauthorized Access Checks (RBAC)
    // -----------------------------------------------------------------------
    console.log('\n6. TEST 4: Unauthorized Access Checks (RBAC)...');

    // Create a pending return for testing
    const pendingReqForRbac = await returnService.createReturnRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      {
        assetId: testAsset3.id,
        reason: 'RBAC test return',
      }
    );

    // 4a. Employee cannot receive return
    let empReceiveBlocked = false;
    try {
      await returnService.receiveReturn(
        { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
        pendingReqForRbac.id,
        { conditionOnReturn: AssetCondition.GOOD, returnLocation: 'Store' }
      );
    } catch (e: any) {
      if (e instanceof AppError && e.statusCode === 403) empReceiveBlocked = true;
    }
    assert(empReceiveBlocked, 'Employee cannot receive physical returns (403 Forbidden)');

    // 4b. Department Manager cannot receive return
    let mgrReceiveBlocked = false;
    try {
      await returnService.receiveReturn(
        { id: manager.id, email: manager.email, role: ROLES.DEPARTMENT_MANAGER },
        pendingReqForRbac.id,
        { conditionOnReturn: AssetCondition.GOOD, returnLocation: 'Store' }
      );
    } catch (e: any) {
      if (e instanceof AppError && e.statusCode === 403) mgrReceiveBlocked = true;
    }
    assert(mgrReceiveBlocked, 'Department Manager cannot receive physical returns (403 Forbidden)');

    // 4c. IT Technician cannot receive return
    if (technician) {
      let techReceiveBlocked = false;
      try {
        await returnService.receiveReturn(
          { id: technician.id, email: technician.email, role: ROLES.IT_TECHNICIAN },
          pendingReqForRbac.id,
          { conditionOnReturn: AssetCondition.GOOD, returnLocation: 'Store' }
        );
      } catch (e: any) {
        if (e instanceof AppError && e.statusCode === 403) techReceiveBlocked = true;
      }
      assert(techReceiveBlocked, 'IT Technician cannot receive physical returns (403 Forbidden)');
    }

    // 4d. Employee cannot request return of another employee's asset
    if (employee2) {
      let crossEmployeeBlocked = false;
      try {
        await returnService.createReturnRequest(
          { id: employee2.id, email: employee2.email, role: ROLES.EMPLOYEE },
          {
            assetId: testAsset3.id, // currently assigned to employee 1
            reason: 'Attempting to return colleague asset',
          }
        );
      } catch (e: any) {
        if (e instanceof AppError && e.statusCode === 403) crossEmployeeBlocked = true;
      }
      assert(crossEmployeeBlocked, 'Employee cannot request return of another employee asset (403 Forbidden)');
    }

    // -----------------------------------------------------------------------
    // TEST 5: Concurrency / Duplicate Receipt Protection
    // -----------------------------------------------------------------------
    console.log('\n7. TEST 5: Concurrency & Duplicate Receipt Protection...');

    // Store keeper receives the pending return
    await returnService.receiveReturn(
      { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
      pendingReqForRbac.id,
      {
        conditionOnReturn: AssetCondition.GOOD,
        returnLocation: 'ICT Asset Store',
      }
    );

    // Second receipt attempt must fail with 409 Conflict
    let duplicateRejected = false;
    try {
      await returnService.receiveReturn(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        pendingReqForRbac.id,
        {
          conditionOnReturn: AssetCondition.GOOD,
          returnLocation: 'ICT Asset Store',
        }
      );
    } catch (e: any) {
      if (e instanceof AppError && e.statusCode === 409) duplicateRejected = true;
    }
    assert(duplicateRejected, 'Second receipt attempt rejected with 409 Conflict');

    // -----------------------------------------------------------------------
    // TEST 6: Walk-in Invalid Asset Rejection
    // -----------------------------------------------------------------------
    console.log('\n8. TEST 6: Walk-in Rejects Non-Assigned Assets...');

    // testAsset1 is now AVAILABLE. Attempting walk-in return on it must be rejected!
    let walkInAvailableRejected = false;
    try {
      await returnService.receiveWalkInReturn(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        {
          assetId: testAsset1.id, // is AVAILABLE now
          conditionOnReturn: AssetCondition.GOOD,
          returnLocation: 'Store',
        }
      );
    } catch (e: any) {
      if (e instanceof AppError && (e.statusCode === 422 || e.statusCode === 400)) {
        walkInAvailableRejected = true;
      }
    }
    assert(walkInAvailableRejected, 'Walk-in return rejects AVAILABLE asset (422 Unprocessable Entity)');

    // -----------------------------------------------------------------------
    // TEST 7: Return Request Cancellation Lifecycle
    // -----------------------------------------------------------------------
    console.log('\n9. TEST 7: Return Request Cancellation Lifecycle...');

    const cancelReq = await returnService.createReturnRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      {
        assetId: testAsset4.id,
        reason: 'Will cancel this request',
      }
    );

    assert(cancelReq.status === ReturnRequestStatus.PENDING, 'Cancellation test request is PENDING');

    const cancelledResult = await returnService.cancelReturnRequest(
      { id: employee.id, email: employee.email, role: ROLES.EMPLOYEE },
      cancelReq.id
    );

    assert(cancelledResult.status === ReturnRequestStatus.CANCELLED, 'Return request cancelled successfully');

    // Store Keeper cannot receive a CANCELLED return request
    let receiveCancelledBlocked = false;
    try {
      await returnService.receiveReturn(
        { id: storekeeper.id, email: storekeeper.email, role: ROLES.STORE_KEEPER },
        cancelReq.id,
        {
          conditionOnReturn: AssetCondition.GOOD,
          returnLocation: 'Store',
        }
      );
    } catch (e: any) {
      if (e instanceof AppError && e.statusCode === 409) receiveCancelledBlocked = true;
    }
    assert(receiveCancelledBlocked, 'Store Keeper cannot receive a CANCELLED request (409 Conflict)');

    // Summary
    console.log('\n======================================================================');
    console.log(`  Phase 11D Verification Complete: ${passedTests}/${totalTests} Tests Passed!`);
    console.log('======================================================================\n');
  } finally {
    // Clean up test data created during test
    console.log('10. Cleaning up test data...');
    try {
      await prisma.assetReturnRequest.deleteMany({
        where: {
          assetId: { in: [testAsset1.id, testAsset2.id, testAsset3.id, testAsset4.id] },
        },
      });
      await prisma.assetAssignment.deleteMany({
        where: {
          assetId: { in: [testAsset1.id, testAsset2.id, testAsset3.id, testAsset4.id] },
        },
      });
      await prisma.asset.deleteMany({
        where: {
          id: { in: [testAsset1.id, testAsset2.id, testAsset3.id, testAsset4.id] },
        },
      });
      console.log('   Test data cleaned up successfully.');
    } catch (cleanErr) {
      console.warn('   Cleanup warning:', cleanErr);
    }
  }
}

runPhase11DReturnsWorkflowVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  });
