'use strict';
/**
 * mqtt.service.js
 * Subscribes to DLNK/+ (live telemetry), parses each message,
 * enriches it from the device DB, and forwards to WebSocket.
 *
 * Topic scheme (from Migcon Excel spec):
 *   DLNK/<mac>   – live telemetry  (subscribed with wildcard DLNK/+)
 *   APRM/<mac>   – alarm messages  (add to TOPICS array if needed)
 *   GPRM/<mac>   – historical log  (add to TOPICS array if needed)
 */
const mqtt        = require('mqtt');
const parser      = require('./parser.service');
const deviceModel = require('../models/device.model');
const ws          = require('./websocket.service');

const BROKER_URL        = process.env.MQTT_BROKER_URL ?? 'mqtt://localhost:1883';
const CLIENT_ID         = `migcon-backend-${Date.now()}`;
const TOPICS            = ['DLNK/+'];
const OFFLINE_TIMEOUT   = parseInt(process.env.MQTT_OFFLINE_TIMEOUT_MS ?? '60000', 10);

let client = null;
const lastSeen = new Map();   // mac → Date.now()

function buildPayload(parsed, db) {
  const channelCount = db?.channels ?? 4;
  return {
    name:          db?.name ?? parsed.mac.toUpperCase(),
    mac:           parsed.mac,
    macFormatted:  parsed.mac.match(/.{2}/g)?.join(':').toUpperCase() ?? parsed.mac,
    group:         db?.group ?? 'Ungrouped',
    modelCode:     parsed.modelCode,
    modelName:     parsed.modelName,
    status:        'Online',
    rssi:          parsed.rssi,
    ipType:        parsed.ipType,
    power:         parsed.power,
    batteryVolts:  parsed.batteryVolts,
    logging:       parsed.logging,
    loggingStatus: parsed.loggingStatus,
    alarm:         parsed.alarm,
    alarmCode:     parsed.alarmCode,
    logCount:      parsed.logCount,
    channels:      parsed.channels.slice(0, channelCount),
    timestamp:     parsed.timestamp,
    receivedAt:    new Date().toISOString(),
  };
}

function handleMessage(topic, buf) {
  const raw = buf.toString('utf8').trim();
  console.log(`[MQTT] ← ${topic} | ${raw}`);

  const result = parser.parse(raw);
  if (!result.ok) {
    console.warn(`[MQTT] Parse error on "${topic}": ${result.error}`);
    return;
  }

  const { data } = result;
  lastSeen.set(data.mac, Date.now());

  const db      = deviceModel.getByMac(data.mac);
  if (!db) console.warn(`[MQTT] Unknown MAC ${data.mac} – using defaults`);

  const payload = buildPayload(data, db);
  ws.broadcast(payload);
  console.log(`[MQTT] → WS: ${payload.name} | CH1=${payload.channels[0]?.value}`);
}

function connect() {
  console.log(`[MQTT] Connecting → ${BROKER_URL}`);
  client = mqtt.connect(BROKER_URL, {
    clientId: CLIENT_ID,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clean: true,
    reconnectPeriod: 5_000,
    connectTimeout: 10_000,
  });

  client.on('connect', () => {
    console.log('[MQTT] Broker connected');
    ws.broadcastNetworkStatus(true);
    client.subscribe(TOPICS, { qos: 1 }, (err, granted) => {
      if (err) return console.error('[MQTT] Subscribe error:', err.message);
      granted.forEach(({ topic, qos }) =>
        console.log(`[MQTT] Subscribed → ${topic} (QoS ${qos})`)
      );
    });
  });

  client.on('message',   handleMessage);
  client.on('error',     (e) => console.error('[MQTT] Error:', e.message));
  client.on('offline',   ()  => { console.warn('[MQTT] Offline'); ws.broadcastNetworkStatus(false); });
  client.on('reconnect', ()  => console.log('[MQTT] Reconnecting…'));
}

function disconnect() { if (client) client.end(true); }

function deviceStatus(mac) {
  const seen = lastSeen.get(mac.toLowerCase());
  return seen && Date.now() - seen < OFFLINE_TIMEOUT ? 'Online' : 'Offline';
}

module.exports = { connect, disconnect, deviceStatus };
