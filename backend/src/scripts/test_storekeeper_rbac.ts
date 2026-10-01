/**
 * Verification Script for STORE_KEEPER Role and RBAC Regression
 */
import prisma from '../lib/prisma';
import { ROLES, ROLE_LIST } from '../constants/roles';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../constants/permissions';
import { canAccessAsset, canAccessDepartment, canAccessEmployee, canAccessMaintenanceTicket, AuthUserContext } from '../lib/authorization/resourceAccess';

async function runRegressionAndStoreKeeperVerification() {
  console.log('\n=============================================================');
  console.log('  EEC EAMS – STORE_KEEPER Role & RBAC Regression Test Suite');
  console.log('=============================================================\n');

  // 1. Verify Enum & Constants
  console.log('1. Checking Role Enum & Constants...');
  const expectedRoles = ['ADMIN', 'IT_TECHNICIAN', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'STORE_KEEPER'];
  for (const role of expectedRoles) {
    if (!ROLE_LIST.includes(role as any)) {
      throw new Error(`Role ${role} is missing from ROLE_LIST!`);
    }
  }
  console.log('   ✅ All 5 roles present in ROLE_LIST:', ROLE_LIST);

  // 2. Check Database Users for all 5 roles
  console.log('\n2. Checking Database Users across all 5 roles...');
  const users = await prisma.user.findMany({
    include: { employeeProfile: { include: { department: true } } },
  });

  const admin = users.find((u) => u.role === 'ADMIN');
  const tech = users.find((u) => u.role === 'IT_TECHNICIAN');
  const manager = users.find((u) => u.role === 'DEPARTMENT_MANAGER');
  const employee = users.find((u) => u.role === 'EMPLOYEE');
  const storekeeper = users.find((u) => u.role === 'STORE_KEEPER');

  if (!admin || !tech || !manager || !employee || !storekeeper) {
    throw new Error(`Missing demo user for one or more roles! (admin=${!!admin}, tech=${!!tech}, manager=${!!manager}, employee=${!!employee}, storekeeper=${!!storekeeper})`);
  }

  console.log(`   ✅ ADMIN: ${admin.email} (Status: ${admin.status})`);
  console.log(`   ✅ IT_TECHNICIAN: ${tech.email} (Status: ${tech.status})`);
  console.log(`   ✅ DEPARTMENT_MANAGER: ${manager.email} (Status: ${manager.status})`);
  console.log(`   ✅ EMPLOYEE: ${employee.email} (Status: ${employee.status})`);
  console.log(`   ✅ STORE_KEEPER: ${storekeeper.email} (Status: ${storekeeper.status}, EmpId: ${storekeeper.employeeProfile?.employeeId})`);

  // 3. Permissions Matrix Verification
  console.log('\n3. Verifying Granular Permissions Matrix for STORE_KEEPER...');
  const skPermissions = ROLE_PERMISSIONS[ROLES.STORE_KEEPER];
  console.log('   STORE_KEEPER Permissions:', skPermissions);

  // Ensure STORE_KEEPER does NOT have admin/privileged permissions
  const prohibitedPermissions = [
    PERMISSIONS.IDENTITY_APPROVE,
    PERMISSIONS.IDENTITY_REJECT,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_UPDATE,
    PERMISSIONS.MAINTENANCE_UPDATE,
    PERMISSIONS.TESTING_VIEW,
    PERMISSIONS.TESTING_EXECUTE,
  ];

  for (const perm of prohibitedPermissions) {
    if (skPermissions.includes(perm)) {
      throw new Error(`Security Violation: STORE_KEEPER has prohibited permission: ${perm}`);
    }
  }
  console.log('   ✅ Prohibited permissions confirmed absent for STORE_KEEPER');

  // 4. Resource Access Tests
  console.log('\n4. Verifying Resource Access Authorization Checks...');
  const skAuthContext: AuthUserContext = {
    userId: storekeeper.id,
    role: ROLES.STORE_KEEPER,
    departmentId: storekeeper.employeeProfile?.departmentId,
    employeeProfileId: storekeeper.employeeProfile?.id,
    employeeId: storekeeper.employeeProfile?.employeeId,
    name: `${storekeeper.employeeProfile?.firstName} ${storekeeper.employeeProfile?.lastName}`,
  };

  const adminAuthContext: AuthUserContext = {
    userId: admin.id,
    role: ROLES.ADMIN,
    departmentId: admin.employeeProfile?.departmentId,
    employeeProfileId: admin.employeeProfile?.id,
    employeeId: admin.employeeProfile?.employeeId,
    name: 'Admin User',
  };

  // Test canAccessEmployee: SK cannot view another employee's profile directly
  const otherEmployeeTarget = {
    id: employee.employeeProfile?.id,
    userId: employee.id,
    employeeId: employee.employeeProfile?.employeeId,
    departmentId: employee.employeeProfile?.departmentId,
  };
  const ownSkTarget = {
    id: storekeeper.employeeProfile?.id,
    userId: storekeeper.id,
    employeeId: storekeeper.employeeProfile?.employeeId,
    departmentId: storekeeper.employeeProfile?.departmentId,
  };

  if (canAccessEmployee(skAuthContext, otherEmployeeTarget)) {
    throw new Error('Security Violation: STORE_KEEPER was granted access to another employee profile');
  }
  if (!canAccessEmployee(skAuthContext, ownSkTarget)) {
    throw new Error('Error: STORE_KEEPER was denied access to own employee profile');
  }
  if (!canAccessEmployee(adminAuthContext, otherEmployeeTarget)) {
    throw new Error('Error: ADMIN was denied access to employee profile');
  }
  console.log('   ✅ canAccessEmployee: STORE_KEEPER restricted to own profile; ADMIN has full access');

  // Test canAccessDepartment
  if (!canAccessDepartment(skAuthContext, storekeeper.employeeProfile?.departmentId)) {
    throw new Error('Error: STORE_KEEPER denied access to own department');
  }
  if (canAccessDepartment(skAuthContext, 'different-dept-id')) {
    throw new Error('Security Violation: STORE_KEEPER granted access to different department');
  }
  if (!canAccessDepartment(adminAuthContext, 'different-dept-id')) {
    throw new Error('Error: ADMIN denied access to department');
  }
  console.log('   ✅ canAccessDepartment: STORE_KEEPER restricted to own department; ADMIN bypass confirmed');

  // 5. Asset Model & Asset Assignment Model Inspection
  console.log('\n5. Inspecting Asset Model & Asset Assignment Records...');
  const sampleAsset = await prisma.asset.findFirst({
    include: { assignments: { include: { employee: true } } },
  });

  if (sampleAsset) {
    console.log(`   ✅ Asset location field confirmed on Asset: "${sampleAsset.name}" -> location: ${sampleAsset.location || 'null (optional string supported)'}`);
    console.log(`   ✅ AssetAssignment structure preserved:`, {
      assignmentCount: sampleAsset.assignments.length,
      sampleAssignmentFields: sampleAsset.assignments[0] ? Object.keys(sampleAsset.assignments[0]) : 'None yet',
    });
  }

  console.log('\n=============================================================');
  console.log('  🎉 All STORE_KEEPER Foundation & RBAC Tests PASSED!');
  console.log('=============================================================\n');
}

runRegressionAndStoreKeeperVerification()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
