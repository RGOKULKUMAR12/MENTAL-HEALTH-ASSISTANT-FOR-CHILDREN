import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { seedIfEmpty } from './seed.js';
import authRoutes from './routes/auth.js';
import parentRoutes from './routes/parents.js';
import assessmentRoutes from './routes/assessments.js';
import appointmentRoutes from './routes/appointments.js';
import alertRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import doctorRoutes from './routes/doctors.js';
import { allowRoles, requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mental-pro-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/parents', requireAuth, parentRoutes);
app.use('/api', doctorRoutes);
app.use('/api', requireAuth, assessmentRoutes);
app.use('/api/appointments', requireAuth, appointmentRoutes);
app.use('/api/alerts', requireAuth, alertRoutes);
app.use('/api/admin', requireAuth, allowRoles('admin'), adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function bootstrap() {
  initDb();
  await seedIfEmpty();
  app.listen(port, () => {
    console.log(`Mental Pro backend listening on http://localhost:${port}`);
  });
}

bootstrap();

