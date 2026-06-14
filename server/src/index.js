import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';

import authRoutes from './routes/auth.js';
import githubRoutes from './routes/github.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contact.js';
import portfolioRoutes from './routes/portfolio.js';

const app = express();

/* ─── Security ─── */
app.use(helmet());
app.use(cors({ origin: config.clientOrigin, credentials: true }));

/* ─── Body parsing ─── */
app.use(express.json({ limit: '10kb' }));

/* ─── Global rate limit ─── */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests — try again in a minute' },
  }),
);

/* ─── Health ─── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

/* ─── Routes ─── */
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/portfolio', portfolioRoutes);

/* ─── 404 ─── */
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

/* ─── Global error handler ─── */
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

/* ─── Start ─── */
app.listen(config.port, () => {
  console.log(`\n  🚀  terminal-bio API server`);
  console.log(`  📡  http://localhost:${config.port}`);
  console.log(`  🌐  Allow origin: ${config.clientOrigin}\n`);
});
