// EEC EAMS – Express Entry Point (Phase 1 Skeleton)
// No API logic yet – structure only

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
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

import departmentRoutes from './modules/departments/department.routes';
import employeeRoutes from './modules/employees/employee.routes';
import assetRoutes from './modules/assets/asset.routes';

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);

// ─── Future Routes ────────────────────────────────────────────────────────────
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/maintenance', maintenanceRoutes);
// app.use('/api/testing', testingRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/notifications', notificationRoutes);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 EEC EAMS API running on port ${PORT}`);
});

export default app;
