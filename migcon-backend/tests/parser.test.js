'use strict';
/**
 * parser.test.js
 * Quick self-contained smoke tests – no test framework required.
 * Run:  node tests/parser.test.js
 */

const { parse } = require('../services/parser.service');

let passed = 0, failed = 0;

function assert(label, condition, details = '') {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}${details ? ' → ' + details : ''}`);
    failed++;
  }
}

// ── Test 1: Valid 17-field string from Excel spec ─────────────────────────────
console.log('\nTest 1 – standard 4-channel payload');
const raw1 = ':02,03,d48bebc8cb,-50,02,D80C,01,FA00,000b08,000a20,000000,000000,00,01,01,1610561640,01';
const r1 = parse(raw1);

assert('parse succeeds',       r1.ok === true);
assert('mac parsed',           r1.data?.mac === 'd48bebc8cb');
assert('rssi parsed',          r1.data?.rssi === -50);
assert('modelCode parsed',     r1.data?.modelCode === '02');
assert('power = external',     r1.data?.power === true);
assert('CH1 = 28.24',          r1.data?.channels[0]?.raw === 28.24,
       `got ${r1.data?.channels[0]?.raw}`);
assert('CH2 = 25.92',          r1.data?.channels[1]?.raw === 25.92,
       `got ${r1.data?.channels[1]?.raw}`);
assert('CH3 = null (000000)',  r1.data?.channels[2]?.raw === null);
assert('alarm active',         r1.data?.alarm === true);  // alarmBit = '01'
assert('logging stopped',      r1.data?.logging === false); // logStatus = '00'
assert('timestamp parsed',     r1.data?.timestamp === 1610561640);

// ── Test 2: Reject short payload ──────────────────────────────────────────────
console.log('\nTest 2 – too few fields');
const r2 = parse(':02,03,d48bebc8cb,-50');
assert('parse fails',          r2.ok === false);
assert('error message set',    typeof r2.error === 'string');

// ── Test 3: Non-string input ──────────────────────────────────────────────────
console.log('\nTest 3 – non-string input');
const r3 = parse(null);
assert('parse fails gracefully', r3.ok === false);

// ── Test 4: Negative temperature (0xFF prefix) ────────────────────────────────
console.log('\nTest 4 – negative temperature');
// 0xFFF48E → 0xFFF48E - 0x1000000 = -2930 → -29.30 °C
const raw4 = ':02,03,aabbccddeeff,-65,02,D80C,01,FA00,fff48e,000a20,000000,000000,01,00,01,1610561640,02';
const r4 = parse(raw4);
assert('parse succeeds',   r4.ok === true);
assert('CH1 is negative',  r4.data?.channels[0]?.raw === -29.3,
       `got ${r4.data?.channels[0]?.raw}`);

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
