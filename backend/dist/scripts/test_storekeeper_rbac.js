"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Verification Script for STORE_KEEPER Role and RBAC Regression
 */
const prisma_1 = __importDefault(require("../lib/prisma"));
const roles_1 = require("../constants/roles");
const permissions_1 = require("../constants/permissions");
const resourceAccess_1 = require("../lib/authorization/resourceAccess");
async function runRegressionAndStoreKeeperVerification() {
    console.log('\n=============================================================');
    console.log('  EEC EAMS – STORE_KEEPER Role & RBAC Regression Test Suite');
    console.log('=============================================================\n');
    // 1. Verify Enum & Constants
    console.log('1. Checking Role Enum & Constants...');
    const expectedRoles = ['ADMIN', 'IT_TECHNICIAN', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'STORE_KEEPER'];
    for (const role of expectedRoles) {
        if (!roles_1.ROLE_LIST.includes(role)) {
            throw new Error(`Role ${role} is missing from ROLE_LIST!`);
        }
    }
    console.log('   ✅ All 5 roles present in ROLE_LIST:', roles_1.ROLE_LIST);
    // 2. Check Database Users for all 5 roles
    console.log('\n2. Checking Database Users across all 5 roles...');
    const users = await prisma_1.default.user.findMany({
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
    const skPermissions = permissions_1.ROLE_PERMISSIONS[roles_1.ROLES.STORE_KEEPER];
    console.log('   STORE_KEEPER Permissions:', skPermissions);
    // Ensure STORE_KEEPER does NOT have admin/privileged permissions
    const prohibitedPermissions = [
        permissions_1.PERMISSIONS.IDENTITY_APPROVE,
        permissions_1.PERMISSIONS.IDENTITY_REJECT,
        permissions_1.PERMISSIONS.SETTINGS_UPDATE,
        permissions_1.PERMISSIONS.EMPLOYEES_CREATE,
        permissions_1.PERMISSIONS.EMPLOYEES_UPDATE,
        permissions_1.PERMISSIONS.DEPARTMENTS_CREATE,
        permissions_1.PERMISSIONS.DEPARTMENTS_UPDATE,
        permissions_1.PERMISSIONS.MAINTENANCE_UPDATE,
        permissions_1.PERMISSIONS.TESTING_VIEW,
        permissions_1.PERMISSIONS.TESTING_EXECUTE,
    ];
    for (const perm of prohibitedPermissions) {
        if (skPermissions.includes(perm)) {
            throw new Error(`Security Violation: STORE_KEEPER has prohibited permission: ${perm}`);
        }
    }
    console.log('   ✅ Prohibited permissions confirmed absent for STORE_KEEPER');
    // 4. Resource Access Tests
    console.log('\n4. Verifying Resource Access Authorization Checks...');
    const skAuthContext = {
        userId: storekeeper.id,
        role: roles_1.ROLES.STORE_KEEPER,
        departmentId: storekeeper.employeeProfile?.departmentId,
        employeeProfileId: storekeeper.employeeProfile?.id,
        employeeId: storekeeper.employeeProfile?.employeeId,
        name: `${storekeeper.employeeProfile?.firstName} ${storekeeper.employeeProfile?.lastName}`,
    };
    const adminAuthContext = {
        userId: admin.id,
        role: roles_1.ROLES.ADMIN,
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
    if ((0, resourceAccess_1.canAccessEmployee)(skAuthContext, otherEmployeeTarget)) {
        throw new Error('Security Violation: STORE_KEEPER was granted access to another employee profile');
    }
    if (!(0, resourceAccess_1.canAccessEmployee)(skAuthContext, ownSkTarget)) {
        throw new Error('Error: STORE_KEEPER was denied access to own employee profile');
    }
    if (!(0, resourceAccess_1.canAccessEmployee)(adminAuthContext, otherEmployeeTarget)) {
        throw new Error('Error: ADMIN was denied access to employee profile');
    }
    console.log('   ✅ canAccessEmployee: STORE_KEEPER restricted to own profile; ADMIN has full access');
    // Test canAccessDepartment
    if (!(0, resourceAccess_1.canAccessDepartment)(skAuthContext, storekeeper.employeeProfile?.departmentId)) {
        throw new Error('Error: STORE_KEEPER denied access to own department');
    }
    if ((0, resourceAccess_1.canAccessDepartment)(skAuthContext, 'different-dept-id')) {
        throw new Error('Security Violation: STORE_KEEPER granted access to different department');
    }
    if (!(0, resourceAccess_1.canAccessDepartment)(adminAuthContext, 'different-dept-id')) {
        throw new Error('Error: ADMIN denied access to department');
    }
    console.log('   ✅ canAccessDepartment: STORE_KEEPER restricted to own department; ADMIN bypass confirmed');
    // 5. Asset Model & Asset Assignment Model Inspection
    console.log('\n5. Inspecting Asset Model & Asset Assignment Records...');
    const sampleAsset = await prisma_1.default.asset.findFirst({
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
    await prisma_1.default.$disconnect();
});
//# sourceMappingURL=test_storekeeper_rbac.js.map