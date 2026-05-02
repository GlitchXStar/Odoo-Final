const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────────
const R = '\x1b[0m', BOLD = '\x1b[1m', DIM = '\x1b[2m';
const clr = (c, s) => `\x1b[${c}m${s}${R}`;
morgan.token('statusColor', (req, res) => {
  const s = res.statusCode;
  if (s >= 500) return clr(91, s);        // red
  if (s >= 400) return clr(93, s);        // yellow
  if (s >= 300) return clr(96, s);        // cyan
  return clr(92, s);                       // green
});
morgan.token('methodColor', (req) => {
  const m = req.method;
  const map = { GET: 94, POST: 92, PUT: 93, DELETE: 91, PATCH: 95 };
  return clr(map[m] || 97, m.padEnd(6));
});
app.use(morgan(
  `  ${DIM}:date[iso]${R} :methodColor ${BOLD}:url${R} ${DIM}→${R} :statusColor ${DIM}:response-time ms${R}`,
  { skip: (req) => req.url === '/health' }
));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EmPay HRMS API', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
