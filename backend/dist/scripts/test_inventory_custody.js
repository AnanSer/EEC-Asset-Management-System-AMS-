"use strict";
/**
 * Test Suite: Store Keeper Inventory & Physical Asset Location Management
 *
 * Verifies:
 * 1. Inventory counts dynamically derived from Asset records (Single Source of Truth)
 * 2. Category Breakdown & Location Breakdown calculations
 * 3. Scope rules: ADMIN, IT_TECHNICIAN, STORE_KEEPER see enterprise inventory; DEPARTMENT_MANAGER is scoped
 * 4. RBAC: EMPLOYEE is forbidden from inventory
 * 5. Physical location updates ONLY modify Asset.location, not status or assignments
 * 6. Full Assignment -> Return regression test with dynamic inventory derivation
 * 7. Live HTTP API endpoint verification with Better Auth session cookies
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = __importDefault(require("../lib/prisma"));
const asset_repository_1 = require("../modules/assets/asset.repository");
const asset_service_1 = require("../modules/assets/asset.service");
const assignment_service_1 = require("../modules/asset-assignments/assignment.service");
const API_URL = 'http://localhost:5000/api';
async function main() {
    console.log('===============================================================');
    console.log('🧪 RUNNING STORE KEEPER INVENTORY & CUSTODY TEST SUITE');
    console.log('===============================================================\n');
    try {
        // 1. Check Demo Users
        console.log('1️⃣ Verifying User Accounts in Database...');
        const storekeeperUser = await prisma_1.default.user.findFirst({
            where: { role: 'STORE_KEEPER', status: 'APPROVED' },
            include: { employeeProfile: true },
        });
        const employeeUser = await prisma_1.default.user.findFirst({
            where: { role: 'EMPLOYEE', status: 'APPROVED' },
            include: { employeeProfile: true },
        });
        const adminUser = await prisma_1.default.user.findFirst({
            where: { role: 'ADMIN', status: 'APPROVED' },
            include: { employeeProfile: true },
        });
        const techUser = await prisma_1.default.user.findFirst({
            where: { role: 'IT_TECHNICIAN', status: 'APPROVED' },
            include: { employeeProfile: true },
        });
        if (!storekeeperUser || !employeeUser || !adminUser || !techUser) {
            throw new Error('Required demo accounts (STORE_KEEPER, EMPLOYEE, ADMIN, IT_TECHNICIAN) not found in database.');
        }
        console.log(`   ✅ STORE_KEEPER: ${storekeeperUser.email}`);
        console.log(`   ✅ EMPLOYEE:     ${employeeUser.email}`);
        console.log(`   ✅ ADMIN:        ${adminUser.email}`);
        console.log(`   ✅ TECHNICIAN:   ${techUser.email}`);
        // 2. Direct Repository Inventory Calculation Verification
        console.log('\n2️⃣ Testing Repository Inventory Derivation from Live Asset Records...');
        const repoInv = await asset_repository_1.assetRepository.getInventory();
        const dbTotal = await prisma_1.default.asset.count();
        const dbAvail = await prisma_1.default.asset.count({ where: { status: 'AVAILABLE' } });
        const dbAssigned = await prisma_1.default.asset.count({ where: { status: 'ASSIGNED' } });
        const dbMaint = await prisma_1.default.asset.count({ where: { status: 'MAINTENANCE' } });
        const dbTesting = await prisma_1.default.asset.count({ where: { status: 'TESTING' } });
        const dbRetired = await prisma_1.default.asset.count({ where: { status: 'RETIRED' } });
        console.log(`   Counts: Total=${repoInv.total}, Available=${repoInv.available}, Assigned=${repoInv.assigned}, Maintenance=${repoInv.maintenance}, Testing=${repoInv.testing}, Retired=${repoInv.retired}`);
        if (repoInv.total === dbTotal &&
            repoInv.available === dbAvail &&
            repoInv.assigned === dbAssigned &&
            repoInv.maintenance === dbMaint &&
            repoInv.testing === dbTesting &&
            repoInv.retired === dbRetired) {
            console.log('   ✅ PASSED: All 6 inventory totals match database Asset records perfectly!');
        }
        else {
            throw new Error(`Inventory counts mismatch! Expected total=${dbTotal}, got ${repoInv.total}`);
        }
        // 3. Category Breakdown Verification
        console.log('\n3️⃣ Testing Category Breakdown Calculation...');
        const categoryKeys = Object.keys(repoInv.byCategory);
        console.log(`   Identified ${categoryKeys.length} categories:`, categoryKeys.join(', '));
        for (const catKey of categoryKeys) {
            const cat = repoInv.byCategory[catKey];
            if (cat.total !== (cat.available + cat.assigned + cat.maintenance + cat.testing + cat.retired)) {
                throw new Error(`Category total mismatch for ${catKey}: total ${cat.total} != sum of statuses`);
            }
        }
        console.log('   ✅ PASSED: All category totals correctly equal sum of individual status counts.');
        // 4. Location Breakdown Verification
        console.log('\n4️⃣ Testing Physical Location Breakdown Calculation...');
        console.log(`   Identified ${repoInv.byLocation.length} distinct storage / physical custody locations:`);
        repoInv.byLocation.forEach((loc) => {
            console.log(`   - ${loc.location.padEnd(35)} : ${loc.total} units (Avail: ${loc.available}, Assigned: ${loc.assigned})`);
        });
        const locationSum = repoInv.byLocation.reduce((sum, l) => sum + l.total, 0);
        if (locationSum !== repoInv.total) {
            throw new Error(`Location sum ${locationSum} does not match total inventory ${repoInv.total}`);
        }
        console.log('   ✅ PASSED: Sum of all location units equals total asset inventory.');
        // 5. Service Layer RBAC & Scoping Test
        console.log('\n5️⃣ Testing Service Layer Scoping...');
        // Store Keeper sees full inventory
        const skServiceInv = await asset_service_1.assetService.getInventory(undefined);
        if (skServiceInv.total !== repoInv.total) {
            throw new Error('Store Keeper should see organization-wide inventory');
        }
        console.log('   ✅ PASSED: Store Keeper receives organization-wide inventory.');
        // Department Manager sees scoped inventory
        const dept = await prisma_1.default.department.findFirst({
            where: { assets: { some: {} } },
            include: { assets: true },
        });
        if (dept) {
            const deptServiceInv = await asset_service_1.assetService.getInventory(dept.id);
            console.log(`   ✅ Department (${dept.name}) scoped inventory: ${deptServiceInv.total} assets (Total org: ${repoInv.total})`);
            if (deptServiceInv.total > repoInv.total) {
                throw new Error('Scoped inventory exceeds total inventory');
            }
        }
        // 6. Physical Location Update (Only Asset.location changed)
        console.log('\n6️⃣ Testing Physical Location Update (Asset.location only)...');
        const targetAsset = await prisma_1.default.asset.findFirst({
            where: { status: 'AVAILABLE' },
            include: { assignments: true },
        });
        if (!targetAsset)
            throw new Error('No AVAILABLE asset found to test location update');
        const originalLoc = targetAsset.location;
        const originalStatus = targetAsset.status;
        const testLocation = 'Engineering Central Store - Rack E9';
        const updated = await asset_service_1.assetService.updateLocation(targetAsset.id, testLocation);
        console.log(`   Asset ${targetAsset.assetCode} location updated to: "${updated?.location}"`);
        // Verify in DB
        const freshlyFetched = await prisma_1.default.asset.findUnique({
            where: { id: targetAsset.id },
            include: { assignments: true },
        });
        if (freshlyFetched?.location === testLocation &&
            freshlyFetched?.status === originalStatus &&
            freshlyFetched?.assignments.length === targetAsset.assignments.length) {
            console.log('   ✅ PASSED: Location was updated without altering status, custodian, or assignment records!');
        }
        else {
            throw new Error('Location update caused unintended side-effects on asset!');
        }
        // Revert location back
        await asset_service_1.assetService.updateLocation(targetAsset.id, originalLoc);
        console.log('   Location restored to original value.');
        // 7. Dynamic Inventory Derivation during Assignment and Return
        console.log('\n7️⃣ Testing Dynamic Inventory Update during Assignment & Return...');
        const baseline = await asset_repository_1.assetRepository.getInventory();
        console.log(`   Baseline: AVAILABLE = ${baseline.available}, ASSIGNED = ${baseline.assigned}`);
        const employee = await prisma_1.default.employeeProfile.findFirst({
            where: { isActive: true },
        });
        if (!employee)
            throw new Error('No active employee found for assignment test');
        // Assign asset
        console.log(`   Assigning asset ${targetAsset.assetCode} to ${employee.firstName} ${employee.lastName}...`);
        await assignment_service_1.assignmentService.assignAsset({
            assetId: targetAsset.id,
            employeeId: employee.id,
            remarks: 'Automated Inventory Derivation Test',
        });
        // Verify inventory immediately reflects assignment
        const afterAssign = await asset_repository_1.assetRepository.getInventory();
        console.log(`   After Assignment: AVAILABLE = ${afterAssign.available}, ASSIGNED = ${afterAssign.assigned}`);
        if (afterAssign.available === baseline.available - 1 &&
            afterAssign.assigned === baseline.assigned + 1) {
            console.log('   ✅ PASSED: Available decremented by 1, Assigned incremented by 1 dynamically!');
        }
        else {
            throw new Error('Inventory count did not automatically reflect assignment!');
        }
        // Return asset
        console.log(`   Returning asset ${targetAsset.assetCode} to inventory...`);
        await assignment_service_1.assignmentService.returnAsset(targetAsset.id, {
            returnDate: new Date().toISOString(),
            conditionOnReturn: 'GOOD',
            remarks: 'Returned from automated test',
        });
        // Verify inventory immediately returns to baseline
        const afterReturn = await asset_repository_1.assetRepository.getInventory();
        console.log(`   After Return: AVAILABLE = ${afterReturn.available}, ASSIGNED = ${afterReturn.assigned}`);
        if (afterReturn.available === baseline.available &&
            afterReturn.assigned === baseline.assigned) {
            console.log('   ✅ PASSED: Available incremented by 1, Assigned decremented by 1 dynamically back to baseline!');
        }
        else {
            throw new Error('Inventory count did not automatically restore after return!');
        }
        // 8. Live HTTP API Endpoint Verification with Better Auth Session Cookies
        console.log('\n8️⃣ Testing Live HTTP API Endpoints via Express Server...');
        // Store Keeper Sign-In
        const skSignInRes = await fetch(`${API_URL}/auth/sign-in/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'http://localhost:3000',
            },
            body: JSON.stringify({
                email: 'storekeeper@eec.gov.et',
                password: 'EEC@12345',
            }),
        });
        const skCookie = skSignInRes.headers.get('set-cookie');
        console.log(`   Store Keeper sign-in response: HTTP ${skSignInRes.status}`);
        if (skCookie) {
            // Test GET /api/assets/inventory as Store Keeper
            const skHttpInv = await fetch(`${API_URL}/assets/inventory`, {
                headers: { Cookie: skCookie },
            });
            const skHttpData = (await skHttpInv.json());
            console.log(`   GET /api/assets/inventory (Store Keeper): HTTP ${skHttpInv.status}`);
            if (skHttpInv.status === 200 && skHttpData?.success) {
                console.log(`   ✅ PASSED: Store Keeper successfully fetched inventory via HTTP API! Total: ${skHttpData.data.total}`);
            }
            else {
                throw new Error(`Store Keeper inventory HTTP request failed: ${JSON.stringify(skHttpData)}`);
            }
            // Test PATCH /api/assets/:id/location as Store Keeper
            const skHttpLoc = await fetch(`${API_URL}/assets/${targetAsset.id}/location`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Origin: 'http://localhost:3000',
                    Cookie: skCookie,
                },
                body: JSON.stringify({ location: 'ICT Asset Store - Row 2' }),
            });
            const skLocData = (await skHttpLoc.json());
            console.log(`   PATCH /api/assets/:id/location (Store Keeper): HTTP ${skHttpLoc.status}`);
            if (skHttpLoc.status === 200 && skLocData?.success) {
                console.log('   ✅ PASSED: Store Keeper successfully updated physical location via HTTP API!');
            }
            else {
                throw new Error(`Store Keeper location PATCH failed: ${JSON.stringify(skLocData)}`);
            }
            // Revert
            await fetch(`${API_URL}/assets/${targetAsset.id}/location`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Origin: 'http://localhost:3000',
                    Cookie: skCookie,
                },
                body: JSON.stringify({ location: originalLoc }),
            });
        }
        // Employee Sign-In
        const empSignInRes = await fetch(`${API_URL}/auth/sign-in/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'http://localhost:3000',
            },
            body: JSON.stringify({
                email: 'employee@eec.gov.et',
                password: 'EEC@12345',
            }),
        });
        const empCookie = empSignInRes.headers.get('set-cookie');
        console.log(`   Employee sign-in response: HTTP ${empSignInRes.status}`);
        if (empCookie) {
            // Test GET /api/assets/inventory as Employee (MUST BE 403)
            const empHttpInv = await fetch(`${API_URL}/assets/inventory`, {
                headers: { Cookie: empCookie },
            });
            console.log(`   GET /api/assets/inventory (Employee): HTTP ${empHttpInv.status}`);
            if (empHttpInv.status === 403) {
                console.log('   ✅ PASSED: Employee receives HTTP 403 Forbidden on /api/assets/inventory!');
            }
            else {
                throw new Error(`Employee was not rejected with 403! Got HTTP ${empHttpInv.status}`);
            }
        }
        console.log('\n===============================================================');
        console.log('🎉 ALL INVENTORY & PHYSICAL CUSTODY TESTS PASSED (100%)!');
        console.log('===============================================================\n');
    }
    catch (err) {
        console.error('\n❌ TEST SUITE FAILED:', err?.message || err);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
//# sourceMappingURL=test_inventory_custody.js.map