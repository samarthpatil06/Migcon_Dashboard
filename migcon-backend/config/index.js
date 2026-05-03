'use strict';
/**
 * config/index.js – central configuration from environment variables.
 * Copy .env.example → .env and fill in your values.
 */
module.exports = {
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    host: process.env.HOST ?? '0.0.0.0',
  },
  mqtt: {
    brokerUrl:        process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883',
    offlineTimeoutMs: parseInt(process.env.MQTT_OFFLINE_TIMEOUT_MS ?? '60000', 10),
  },
  websocket: {
    corsOrigin: (process.env.WS_CORS_ORIGIN ?? 'http://localhost:4200')
      .split(',').map((s) => s.trim()),
  },
};
