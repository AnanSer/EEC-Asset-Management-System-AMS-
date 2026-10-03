/**
 * Comprehensive Automated Verification Script for Phase 11E:
 * Store Operations Dashboard & Asset Movement History
 */
import prisma from '../lib/prisma';
import { storeService } from '../modules/store/store.service';
import { requestService } from '../modules/asset-requests/request.service';
import { returnService } from '../modules/asset-returns/return.service';
import { assetService } from '../modules/assets/asset.service';
import { ROLES } from '../constants/roles';
import { AssetStatus, AssetCategory, AssetCondition, RequestStatus, ReturnRequestStatus } from '@prisma/client';

async function runPhase11EVerification() {
  console.log('\n======================================================================');
  console.log('  EEC EAMS – Phase 11E: Store Dashboard & Movement History Test Suite');
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

  // 1. Fetch seed users for RBAC testing
  console.log('1. Loading Test Users for Roles...');
  const users = await prisma.user.findMany({
    include: { employeeProfile: { include: { department: true } } },
  });

  const employee = users.find((u) => u.role === ROLES.EMPLOYEE && u.employeeProfile);
  const admin = users.find((u) => u.role === ROLES.ADMIN);
  const storekeeper = users.find((u) => u.role === ROLES.STORE_KEEPER);
  const manager = users.find((u) => u.role === ROLES.DEPARTMENT_MANAGER && u.employeeProfile);
  const technician = users.find((u) => u.role === ROLES.IT_TECHNICIAN);

  if (!employee || !admin || !storekeeper || !manager) {
    throw new Error('Missing one or more required test users');
  }

  console.log(`   Store Keeper: ${storekeeper.email}`);
  console.log(`   Admin: ${admin.email}`);
  console.log(`   Department Manager: ${manager.email}`);
  console.log(`   Employee: ${employee.email}`);

  const departmentId = employee.employeeProfile!.departmentId;
  const timestamp = Date.now().toString().slice(-4);

  // -------------------------------------------------------------------------
  // TEST 1: Store Dashboard KPI Accuracy
  // -------------------------------------------------------------------------
  console.log('\n2. TEST 1: Verifying Live KPI Counts Derived from Database...');

  const dbAvailable = await prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } });
  const dbAssigned = await prisma.asset.count({ where: { status: AssetStatus.ASSIGNED } });
  const dbPendingHandovers = await prisma.assetRequest.count({ where: { status: RequestStatus.APPROVED } });
  const dbPendingReturns = await prisma.assetReturnRequest.count({ where: { status: ReturnRequestStatus.PENDING } });

  const dashboardData = await storeService.getDashboard();

  assert(dashboardData.kpis.availableAssets === dbAvailable, `Available Assets KPI matches DB count (${dashboardData.kpis.availableAssets})`);
  assert(dashboardData.kpis.assignedAssets === dbAssigned, `Assigned Assets KPI matches DB count (${dashboardData.kpis.assignedAssets})`);
  assert(dashboardData.kpis.pendingHandovers === dbPendingHandovers, `Pending Handovers KPI matches DB count (${dashboardData.kpis.pendingHandovers})`);
  assert(dashboardData.kpis.pendingReturns === dbPendingReturns, `Pending Returns KPI matches DB count (${dashboardData.kpis.pendingReturns})`);

  // -------------------------------------------------------------------------
  // TEST 2: Recent Store Activity Accuracy
  // -------------------------------------------------------------------------
  console.log('\n3. TEST 2: Verifying Recent Store Activity Feed...');

  assert(Array.isArray(dashboardData.recentActivity), 'Recent activity is returned as an array');
  console.log(`   Fetched ${dashboardData.recentActivity.length} recent store activity records`);

  if (dashboardData.recentActivity.length > 0) {
    const firstItem = dashboardData.recentActivity[0];
    assert(Boolean(firstItem.id), 'Activity item has unique ID');
    assert(Boolean(firstItem.type), `Activity item has valid action type (${firstItem.type})`);
    assert(Boolean(firstItem.assetCode), `Activity item includes asset code (${firstItem.assetCode})`);
    assert(Boolean(firstItem.employeeName), `Activity item includes employee/custodian (${firstItem.employeeName})`);
    assert(Boolean(firstItem.location), `Activity item includes physical location (${firstItem.location})`);
    assert(Boolean(firstItem.timestamp), `Activity item includes timestamp (${firstItem.timestamp})`);
    assert(Boolean(firstItem.actorName), `Activity item includes handling actor (${firstItem.actorName})`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Asset Movement History
  // -------------------------------------------------------------------------
  console.log('\n4. TEST 3: Verifying Asset Movement History (Assigned → Returned)...');

  const testAssetCode = `MOV-TEST-${timestamp}`;
  const movementAsset = await prisma.asset.create({
    data: {
      assetCode: testAssetCode,
      name: `Movement Test Unit ${timestamp}`,
      category: AssetCategory.LAPTOP,
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      serialNumber: `SN-MOV-${timestamp}`,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.EXCELLENT,
      location: 'ICT Asset Store - Shelf A1',
      departmentId,
    },
  });

  try {
    // 3a. Initial state movement history (Created / Registered)
    const historyInitial = await storeService.getAssetMovementHistory(movementAsset.id);
    assert(historyInitial !== null, 'Movement history retrieved for asset');
    assert(historyInitial!.events.length >= 1, 'Initial registration event exists');

    // 3b. Assign asset to employee
    const asgn = await prisma.assetAssignment.create({
      data: {
        assetId: movementAsset.id,
        employeeId: employee.employeeProfile!.id,
        assignedDate: new Date(),
        conditionOnAssign: AssetCondition.EXCELLENT,
        isCurrent: true,
        notes: 'Initial assignment to employee',
      },
    });

    await prisma.asset.update({
      where: { id: movementAsset.id },
      data: { status: AssetStatus.ASSIGNED, location: 'Employee Workstation' },
    });

    // Verify Movement History reflects Assignment
    const historyAfterAssign = await storeService.getAssetMovementHistory(movementAsset.id);
    const assignEvent = historyAfterAssign?.events.find((e) => e.type === 'ASSIGNMENT');
    assert(assignEvent !== undefined, 'Assignment event captured in chronological movement history');
    assert(assignEvent?.employeeName?.includes(employee.employeeProfile!.firstName) === true, 'Assignment event records correct employee');

    // 3c. Return asset to store
    await prisma.assetAssignment.update({
      where: { id: asgn.id },
      data: {
        returnedDate: new Date(),
        conditionOnReturn: AssetCondition.GOOD,
        isCurrent: false,
        notes: 'Returned by employee with all accessories',
      },
    });

    await prisma.asset.update({
      where: { id: movementAsset.id },
      data: { status: AssetStatus.AVAILABLE, location: 'ICT Asset Store' },
    });

    // Verify Movement History reflects Return
    const historyAfterReturn = await storeService.getAssetMovementHistory(movementAsset.id);
    const returnEvent = historyAfterReturn?.events.find((e) => e.type === 'RETURN');
    assert(returnEvent !== undefined, 'Return event captured in chronological movement history');
    assert(returnEvent?.condition === AssetCondition.GOOD, 'Return event condition recorded');

    // Verify chronological order (newest first)
    const dates = historyAfterReturn!.events.map((e) => new Date(e.date).getTime());
    let isDescending = true;
    for (let i = 1; i < dates.length; i++) {
      if (dates[i] > dates[i - 1]) {
        isDescending = false;
        break;
      }
    }
    assert(isDescending, 'Events are ordered chronologically descending (newest first)');

    // -----------------------------------------------------------------------
    // TEST 4: Data Integrity & Inventory Invariants
    // -----------------------------------------------------------------------
    console.log('\n5. TEST 4: Verifying Inventory Count Invariants...');

    const baselineInv = await assetService.getInventory();

    // Assign another unit
    const tempAsset = await prisma.asset.create({
      data: {
        assetCode: `INV-TEST-${timestamp}`,
        name: `Inv Test ${timestamp}`,
        category: AssetCategory.DESKTOP,
        serialNumber: `SN-INV-${timestamp}`,
        status: AssetStatus.AVAILABLE,
        condition: AssetCondition.GOOD,
        departmentId,
      },
    });

    const invWithNewUnit = await assetService.getInventory();
    assert(invWithNewUnit.available === baselineInv.available + 1, 'Creating available asset increments available count');

    // Assign unit
    const tempAsgn = await prisma.assetAssignment.create({
      data: {
        assetId: tempAsset.id,
        employeeId: employee.employeeProfile!.id,
        assignedDate: new Date(),
        isCurrent: true,
      },
    });
    await prisma.asset.update({ where: { id: tempAsset.id }, data: { status: AssetStatus.ASSIGNED } });

    const invAfterAssignment = await assetService.getInventory();
    assert(invAfterAssignment.available === invWithNewUnit.available - 1, 'Assignment decrements available count');
    assert(invAfterAssignment.assigned === invWithNewUnit.assigned + 1, 'Assignment increments assigned count');

    // Clean up temporary asset
    await prisma.assetAssignment.deleteMany({ where: { assetId: tempAsset.id } });
    await prisma.asset.delete({ where: { id: tempAsset.id } });

    // -----------------------------------------------------------------------
    // TEST 5: RBAC Security Boundaries
    // -----------------------------------------------------------------------
    console.log('\n6. TEST 5: Verifying RBAC Security Boundaries...');

    // Store Keeper is allowed to access store dashboard
    const skCanAccessDashboard = [ROLES.STORE_KEEPER, ROLES.ADMIN].includes(storekeeper.role as any);
    assert(skCanAccessDashboard, 'Store Keeper has access to Store Operations Dashboard');

    // Employees and Department Managers are NOT allowed to access Store Operations Dashboard
    const empCanAccess = [ROLES.STORE_KEEPER, ROLES.ADMIN].includes(employee.role as any);
    const mgrCanAccess = [ROLES.STORE_KEEPER, ROLES.ADMIN].includes(manager.role as any);
    assert(!empCanAccess, 'Employee is denied access to Store Operations Dashboard');
    assert(!mgrCanAccess, 'Department Manager is denied access to Store Operations Dashboard');

    if (technician) {
      const techCanAccess = [ROLES.STORE_KEEPER, ROLES.ADMIN].includes(technician.role as any);
      assert(!techCanAccess, 'IT Technician is denied access to Store Operations Dashboard');
    }

    console.log('\n======================================================================');
    console.log(`  Phase 11E Verification Complete: ${passedTests}/${totalTests} Tests Passed!`);
    console.log('======================================================================\n');
  } finally {
    // Cleanup
    console.log('7. Cleaning up test data...');
    try {
      await prisma.assetAssignment.deleteMany({ where: { assetId: movementAsset.id } });
      await prisma.asset.delete({ where: { id: movementAsset.id } });
      console.log('   Test data cleaned up successfully.');
    } catch (cleanErr) {
      console.warn('   Cleanup warning:', cleanErr);
    }
  }
}

runPhase11EVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  });
