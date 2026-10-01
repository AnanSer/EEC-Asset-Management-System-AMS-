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
import 'dotenv/config';
//# sourceMappingURL=test_inventory_custody.d.ts.map