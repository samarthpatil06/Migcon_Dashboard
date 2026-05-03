'use strict';
const http        = require('http');
const express     = require('express');
const cors        = require('cors');
const config      = require('./config');
const ws          = require('./services/websocket.service');
const mqttSvc     = require('./services/mqtt.service');
const deviceModel = require('./models/device.model');

const app = express();
app.use(cors({ origin: config.websocket.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', uptime: process.uptime() })
);

app.get('/api/devices', (_req, res) =>
  res.json(
    deviceModel.getAll().map((d) => ({ ...d, status: mqttSvc.deviceStatus(d.mac) }))
  )
);

const httpServer = http.createServer(app);

ws.init(httpServer, { corsOrigin: config.websocket.corsOrigin });
mqttSvc.connect();

const { port, host } = config.server;
httpServer.listen(port, host, () => {
  console.log(`[Server] HTTP + WS listening on http://${host}:${port}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
let isShuttingDown = false;

function shutdown(sig) {
  if (isShuttingDown) return;   // ignore repeated signals
  isShuttingDown = true;

  console.log(`\n[Server] ${sig} – shutting down`);
  mqttSvc.disconnect();

  // Force-exit after 3 s if httpServer.close() hangs on open sockets
  const forceExit = setTimeout(() => {
    console.log('[Server] Force exit after timeout');
    process.exit(0);
  }, 3000);
  forceExit.unref();  // don't let this timer keep the process alive normally

  httpServer.close(() => {
    console.log('[Server] Closed cleanly');
    process.exit(0);
  });
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
