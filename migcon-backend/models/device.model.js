'use strict';
/**
 * device.model.js
 * In-memory device registry.
 * Replace with a real DB (MongoDB / PostgreSQL / SQLite) in production.
 *
 * mac must be lowercase and colon-free to match MQTT field index 2.
 */
const devices = [
  { name: 'E0C0', mac: 'e0c061f81f', modelCode: '02', channels: 4, group: 'THI Device' },
  { name: 'F0CA', mac: 'f0ca20de25', modelCode: '04', channels: 2, group: 'THI Device' },
  { name: 'D48B', mac: 'd48bebc8cb', modelCode: '02', channels: 4, group: 'THI Device' },
];

const getByMac = (mac) => devices.find((d) => d.mac === mac.toLowerCase()) ?? null;
const getAll   = ()     => devices;

module.exports = { getByMac, getAll };
