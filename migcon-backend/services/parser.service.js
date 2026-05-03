'use strict';

const FIELD_COUNT = 17;
const LOGGING_STATUS = { '00': 'stopped', '01': 'logging', '02': 'pending' };
const IP_TYPES = {
  '00': 'unregistered-relay', '01': 'unregistered-device',
  '02': 'local', '03': 'wifi', '04': 'ethernet', '05': 'gprs', '06': 'usb',
};

function hexToTemperature(hex) {
  if (!hex || hex === '000000' || !hex.trim()) return null;
  const raw = parseInt(hex, 16);
  if (isNaN(raw)) return null;
  const celsius = raw > 0x7fffff ? (raw - 0x1000000) / 100 : raw / 100;
  return parseFloat(celsius.toFixed(2));
}

function buildChannel(name, hex) {
  const raw = hexToTemperature(hex);
  return { name, value: raw !== null ? `${raw} °C` : '--', raw };
}

function parse(rawString) {
  if (typeof rawString !== 'string') {
    return { ok: false, error: 'Payload is not a string' };
  }
  const clean = rawString.startsWith(':') ? rawString.slice(1) : rawString;
  const fields = clean.split(',').map((f) => f.trim());
  if (fields.length !== FIELD_COUNT) {
    return { ok: false, error: `Expected ${FIELD_COUNT} fields, got ${fields.length}` };
  }
  const [
    header, ipTypeRaw, mac, rssiRaw, modelCode,
    batteryHex, powerRaw, logCountHex,
    ch1Hex, ch2Hex, ch3Hex, ch4Hex,
    logStatusRaw, alarmRaw, modelName, timestampRaw, packetNumber,
  ] = fields;

  return {
    ok: true,
    data: {
      mac: mac.toLowerCase(),
      modelCode, modelName,
      rssi: parseInt(rssiRaw, 10) || null,
      ipType: IP_TYPES[ipTypeRaw] ?? ipTypeRaw,
      power: powerRaw === '01',
      batteryVolts: parseFloat((parseInt(batteryHex, 16) / 1000).toFixed(3)),
      loggingStatus: LOGGING_STATUS[logStatusRaw] ?? logStatusRaw,
      logging: logStatusRaw === '01',
      alarm: alarmRaw !== '00',
      alarmCode: alarmRaw,
      logCount: parseInt(logCountHex, 16),
      channels: [
        buildChannel('CH1', ch1Hex),
        buildChannel('CH2', ch2Hex),
        buildChannel('CH3', ch3Hex),
        buildChannel('CH4', ch4Hex),
      ],
      timestamp: parseInt(timestampRaw, 10),
      packetNumber: parseInt(packetNumber, 16),
      header,
    },
  };
}

module.exports = { parse, hexToTemperature };
