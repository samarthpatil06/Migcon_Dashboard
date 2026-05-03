'use strict';

/**
 * parser.test.js
 *
 * Run with:  node parser.test.js
 *
 * Tests cover:
 *   - Valid 17-field string (happy path)
 *   - Wrong field count (validation)
 *   - Negative temperature via two's complement
 *   - All-zero channel (disconnected sensor)
 *   - buildDevicePayload output shape
 */

const { parseDeviceString, buildDevicePayload, hexToTemperature } = require('./services/parser.service');

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// ── hexToTemperature ─────────────────────────────────────────────────────────

console.log('\n[ hexToTemperature ]');

assert('000b08 → 28.24°C', hexToTemperature('000b08') === 28.24);
assert('000a20 → 25.92°C', hexToTemperature('000a20') === 25.92);
assert('000000 → null (disconnected)', hexToTemperature('000000') === null);
// Negative: 0xFFF48E → 0xFFF48E - 0x1000000 = -2930 → -29.30°C
assert('FFF48E → -29.30°C', hexToTemperature('FFF48E') === -29.30, `got ${hexToTemperature('FFF48E')}`);
assert('null input → null', hexToTemperature(null) === null);

// ── parseDeviceString ─────────────────────────────────────────────────────────

console.log('\n[ parseDeviceString — valid string ]');

const SAMPLE = ':02,03,d48bebc8cb,-50,02,D80C,01,FA00,000b08,000a20,000000,000000,00,01,01,1610561640,01';
const res = parseDeviceString(SAMPLE);

assert('ok === true', res.ok === true);
assert('mac parsed', res.data.mac === 'd48bebc8cb');
assert('rssi parsed', res.data.rssi === -50);
assert('power on (01)', res.data.power === true);
assert('alarm false (01 → true)', res.data.alarm === true);  // alarmBit=01
assert('logStatus stopped (00)', res.data.logStatus === 'stopped');
assert('ch1 = 28.24', res.data.channels.ch1.value === 28.24);
assert('ch2 = 25.92', res.data.channels.ch2.value === 25.92);
assert('ch3 = null (000000)', res.data.channels.ch3.value === null);
assert('ch4 = null (000000)', res.data.channels.ch4.value === null);
assert('timestamp parsed', res.data.timestamp === 1610561640);
assert('packetNumber = "01"', res.data.packetNumber === '01');
assert('battery voltage', res.data.battery.voltage === 3.340, `got ${res.data.battery.voltage}`);

console.log('\n[ parseDeviceString — wrong field count ]');

const badRes = parseDeviceString(':02,03,d48bebc8cb,-50');
assert('ok === false for short string', badRes.ok === false);
assert('error message present', typeof badRes.error === 'string');

console.log('\n[ parseDeviceString — empty input ]');

const emptyRes = parseDeviceString('');
assert('ok === false for empty string', emptyRes.ok === false);

// ── buildDevicePayload ────────────────────────────────────────────────────────

console.log('\n[ buildDevicePayload ]');

const dbDevice = { name: 'D48B', mac: 'd48bebc8cb', modelCode: '02', channels: 2, group: 'THI Device' };
const payload = buildDevicePayload(res.data, dbDevice);

assert('name = D48B', payload.name === 'D48B');
assert('status = Online', payload.status === 'Online');
assert('rssi = -50', payload.rssi === -50);
assert('power = true', payload.power === true);
assert('alarm = true', payload.alarm === true);
assert('channels length = 2 (from dbDevice)', payload.channels.length === 2);
assert('CH1 value formatted', payload.channels[0].value === '28.24°C');
assert('CH2 value formatted', payload.channels[1].value === '25.92°C');
assert('group present', payload.group === 'THI Device');

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
