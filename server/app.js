require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const gamesRoutes = require('./routes/games');
const playersRoutes = require('./routes/players');
const requestsRoutes = require('./routes/requests');
const communitiesRoutes = require('./routes/communities');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const { errorHandler } = require('./middleware/errorHandler');

/** Comma-separated list in CLIENT_URL (e.g. Vercel prod + preview URLs) */
function getCorsOrigins() {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

let cachedApp;

function buildApp() {
  if (cachedApp) return cachedApp;

  const corsOrigins = getCorsOrigins();
  const corsOriginOption =
    corsOrigins.length === 0 ? true : corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins;

  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(morgan('dev'));
  app.use(
    cors({
      origin: corsOriginOption,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/games', gamesRoutes);
  app.use('/api/players', playersRoutes);
  app.use('/api/requests', requestsRoutes);
  app.use('/api/communities', communitiesRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/chat', chatRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found', code: 404 });
  });

  app.use(errorHandler);

  cachedApp = app;
  return app;
}

module.exports = { buildApp, getCorsOrigins };
