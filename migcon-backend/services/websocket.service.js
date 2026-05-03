'use strict';
const { Server } = require('socket.io');
let io = null;

function init(httpServer, options = {}) {
  io = new Server(httpServer, {
    cors: {
      origin: options.corsOrigin ?? 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Allow both polling and websocket — required for Angular dev server
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected  → id=${socket.id} transport=${socket.conn.transport.name}`);

    socket.emit('network:status', { connected: true });

    // Log transport upgrade (polling → websocket)
    socket.conn.on('upgrade', (transport) => {
      console.log(`[WS] Client upgraded   → id=${socket.id} transport=${transport.name}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WS] Client disconnected → id=${socket.id}, reason=${reason}`);
    });
  });

  console.log('[WS] Socket.IO server ready');
  return io;
}

function broadcast(payload) {
  if (!io) { console.warn('[WS] broadcast() before init() – dropped'); return; }
  io.emit('device:update', payload);
}

function broadcastNetworkStatus(connected) {
  if (io) io.emit('network:status', { connected });
}

module.exports = { init, broadcast, broadcastNetworkStatus };
