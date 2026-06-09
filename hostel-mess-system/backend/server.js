require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/auth');
const studentRoutes = require('./src/routes/students');
const messRoutes = require('./src/routes/messPlans');
const billingRoutes = require('./src/routes/billing');

const { requireAdminAuth } = require('./src/middleware/auth');

const app = express();

app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.get('/health', (req, res) => res.json({ ok: true }));

// Auth (JWT)
app.use('/api/auth', authRoutes);

// Protected CRUD APIs
app.use('/api/students', requireAdminAuth, studentRoutes);
app.use('/api/mess-plans', requireAdminAuth, messRoutes);
app.use('/api/billing', requireAdminAuth, billingRoutes);

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required');
}

const port = process.env.PORT || 4000;

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`[backend] listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[backend] Mongo connection error:', err);
    process.exit(1);
  });

