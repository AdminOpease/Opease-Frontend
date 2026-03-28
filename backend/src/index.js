import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import driversRoutes from './routes/drivers.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import rotaRoutes from './routes/rota.routes.js';
import planAmRoutes from './routes/planAm.routes.js';
import planPmRoutes from './routes/planPm.routes.js';
import vansRoutes from './routes/vans.routes.js';
import workingHoursRoutes from './routes/workingHours.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import changeRequestsRoutes from './routes/changeRequests.routes.js';
import stationsRoutes from './routes/stations.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Global Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driversRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/rota', rotaRoutes);
app.use('/api/plans/am', planAmRoutes);
app.use('/api/plans/pm', planPmRoutes);
app.use('/api/vans', vansRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/change-requests', changeRequestsRoutes);
app.use('/api/stations', stationsRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 OpEase API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;
