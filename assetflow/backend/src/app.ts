import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { authRouter } from './routes/auth.routes';
import { departmentRouter } from './routes/department.routes';
import { categoryRouter } from './routes/category.routes';
import { userRouter } from './routes/user.routes';
import { assetRouter } from './routes/asset.routes';
import { allocationRouter } from './routes/allocation.routes';
import { bookingRouter } from './routes/booking.routes';
import { maintenanceRouter } from './routes/maintenance.routes';
import { auditRouter } from './routes/audit.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import { reportsRouter } from './routes/reports.routes';
import { notificationRouter } from './routes/notification.routes';
import { activityLogRouter } from './routes/activityLog.routes';

const app = express();

// Security & Parsing
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
app.use('/api/assets', assetRouter);
app.use('/api/allocations', allocationRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/audits', auditRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/activity-logs', activityLogRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 AssetFlow Backend running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
