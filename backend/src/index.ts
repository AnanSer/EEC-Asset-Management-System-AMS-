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

// ─── Future Routes (Phase 2+) ─────────────────────────────────────────────────
// app.use('/api/v1/assets', assetRoutes);
// app.use('/api/v1/departments', departmentRoutes);
// app.use('/api/v1/employees', employeeRoutes);
// app.use('/api/v1/assignments', assignmentRoutes);
// app.use('/api/v1/maintenance', maintenanceRoutes);
// app.use('/api/v1/testing', testingRoutes);
// app.use('/api/v1/reports', reportRoutes);
// app.use('/api/v1/notifications', notificationRoutes);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 EEC EAMS API running on port ${PORT}`);
});

export default app;
