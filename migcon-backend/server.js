'use strict';
require('dotenv').config();

const http        = require('http');
const express     = require('express');
const cors        = require('cors');
const config      = require('./config');
const { connectDB } = require('./config/db');
const ws          = require('./services/websocket.service');
const mqttSvc     = require('./services/mqtt.service');
const deviceModel = require('./models/device.model');

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const dataRoutes = require('./routes/data.routes');

const app = express();
app.use(cors({ origin: config.websocket.corsOrigin }));
app.use(express.json());

// ── Existing routes (unchanged) ───────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

app.get('/api/devices', (_req, res) =>
  res.json(
    deviceModel.getAll().map((d) => ({ ...d, status: mqttSvc.deviceStatus(d.mac) }))
  )
);

// ── New API routes ────────────────────────────────────────────────────────────
app.use('/api', authRoutes);   // POST /api/login, POST /api/register
app.use('/api', dataRoutes);   // GET  /api/latest, /api/history, /api/alerts

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

(async () => {
  await connectDB();            // Connect MongoDB first

  ws.init(httpServer, { corsOrigin: config.websocket.corsOrigin });
  mqttSvc.connect();

  const { port, host } = config.server;
  httpServer.listen(port, host, () => {
    console.log(`[Server] HTTP + WS listening on http://${host}:${port}`);
  });
})();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
let isShuttingDown = false;

function shutdown(sig) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Server] ${sig} – shutting down`);
  mqttSvc.disconnect();

  const forceExit = setTimeout(() => {
    console.log('[Server] Force exit after timeout');
    process.exit(0);
  }, 3000);
  forceExit.unref();

  httpServer.close(() => {
    console.log('[Server] Closed cleanly');
    process.exit(0);
  });
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
