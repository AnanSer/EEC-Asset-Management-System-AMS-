"use strict";
// EEC EAMS – Express Entry Point (Phase 1 Skeleton)
// No API logic yet – structure only
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'EEC EAMS API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
const department_routes_1 = __importDefault(require("./modules/departments/department.routes"));
const employee_routes_1 = __importDefault(require("./modules/employees/employee.routes"));
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/departments', department_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
// ─── Future Routes ────────────────────────────────────────────────────────────
// app.use('/api/assets', assetRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/testing', testingRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/notifications', notificationRoutes);
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 EEC EAMS API running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map