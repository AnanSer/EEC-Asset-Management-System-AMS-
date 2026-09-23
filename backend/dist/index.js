"use strict";
// EEC EAMS – Express Entry Point
// Phase 9A, 9A.1 & 9A.2 / 9B: Better Auth, Auth Middleware & Identity Module
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
const prisma_1 = __importDefault(require("./lib/prisma"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const identity_routes_1 = __importDefault(require("./modules/identity/identity.routes"));
const department_routes_1 = __importDefault(require("./modules/departments/department.routes"));
const employee_routes_1 = __importDefault(require("./modules/employees/employee.routes"));
const asset_routes_1 = __importDefault(require("./modules/assets/asset.routes"));
const assignment_routes_1 = __importDefault(require("./modules/asset-assignments/assignment.routes"));
const maintenance_routes_1 = __importDefault(require("./modules/maintenance/maintenance.routes"));
const testing_routes_1 = __importDefault(require("./modules/testing/testing.routes"));
const search_routes_1 = __importDefault(require("./modules/search/search.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ─── Security & CORS Middleware ──────────────────────────────────────────────
app.use((0, helmet_1.default)({
    // Relax CSP for API-only backend
    contentSecurityPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));
// ─── Protected Verification & User Info Auth Endpoint (Phase 9A.1 & 9B) ────────
// Mounted before Better Auth wildcard handler so /api/auth/me is handled
app.get(['/api/auth/me', '/api/api/auth/me'], auth_middleware_1.requireAuth, async (req, res) => {
    const businessUser = await prisma_1.default.user.findUnique({
        where: { email: req.auth.user.email },
        include: {
            employeeProfile: {
                include: {
                    department: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return res.status(200).json({
        success: true,
        data: {
            userId: req.auth.user.id,
            email: req.auth.user.email,
            user: req.auth.user,
            session: req.auth.session,
            businessUser: businessUser
                ? {
                    id: businessUser.id,
                    email: businessUser.email,
                    role: businessUser.role,
                    status: businessUser.status,
                    isEmailVerified: businessUser.isEmailVerified,
                    employeeProfile: businessUser.employeeProfile,
                }
                : null,
        },
    });
});
// ─── Better Auth Handler ─────────────────────────────────────────────────────
// IMPORTANT: Must be mounted BEFORE express.json() so Better Auth gets raw body stream.
// Express v5 wildcard syntax: /*splat
app.all('/api/auth/*splat', (0, node_1.toNodeHandler)(auth_1.auth));
// ─── Body Parsing Middleware ─────────────────────────────────────────────────
// Mounted after Better Auth handlers so it doesn't consume Better Auth's raw stream.
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
// ─── Identity & Business Routes ──────────────────────────────────────────────
app.use('/api/identity', identity_routes_1.default);
app.use('/api/departments', department_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/assets', asset_routes_1.default);
app.use('/api/assignments', assignment_routes_1.default);
app.use('/api/maintenance', maintenance_routes_1.default);
app.use('/api/testing', testing_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 EEC EAMS API running on port ${PORT}`);
    console.log(`🔐 Better Auth ready at http://localhost:${PORT}/api/auth`);
});
exports.default = app;
//# sourceMappingURL=index.js.map