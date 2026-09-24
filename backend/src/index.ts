// EEC EAMS – Express Entry Point
// Phase 9A, 9A.1 & 9A.2 / 9B: Better Auth, Auth Middleware & Identity Module

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth';
import prisma from './lib/prisma';
import { requireAuth } from './middleware/auth.middleware';
import { verifyEmailTransporter } from './lib/email';



import identityRoutes from './modules/identity/identity.routes';
import departmentRoutes from './modules/departments/department.routes';
import employeeRoutes from './modules/employees/employee.routes';
import assetRoutes from './modules/assets/asset.routes';
import assignmentRoutes from './modules/asset-assignments/assignment.routes';
import maintenanceRoutes from './modules/maintenance/maintenance.routes';
import testingRoutes from './modules/testing/testing.routes';
import searchRoutes from './modules/search/search.routes';
import reportRoutes from './modules/reports/report.routes';
import settingsRoutes from './modules/settings/settings.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & CORS Middleware ──────────────────────────────────────────────
app.use(helmet({
  // Relax CSP for API-only backend
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// ─── Protected Verification & User Info Auth Endpoint (Phase 9A.1 & 9B) ────────
// Mounted before Better Auth wildcard handler so /api/auth/me is handled
app.get(['/api/auth/me', '/api/api/auth/me'], requireAuth, async (req, res) => {
  const businessUser = await prisma.user.findUnique({
    where: { email: req.auth!.user.email },
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
      userId: req.auth!.user.id,
      email: req.auth!.user.email,
      user: req.auth!.user,
      session: req.auth!.session,
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
app.all('/api/auth/*splat', toNodeHandler(auth));

// ─── Body Parsing Middleware ─────────────────────────────────────────────────
// Mounted after Better Auth handlers so it doesn't consume Better Auth's raw stream.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/identity', identityRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/testing', testingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 EEC EAMS API running on port ${PORT}`);
  console.log(`🔐 Better Auth ready at http://localhost:${PORT}/api/auth`);
  await verifyEmailTransporter();
});

export default app;
