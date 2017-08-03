const _ = require('./utils');
const assert = require('./assert');
const bin = require('./bin');
const logger = require('./logger')();

module.exports = {
  encode,
  decode,
  map: _.map,
  toBinary,
  fromBinary
};

const octect = 8;
const radix = 6;
const emptyBuffer = '000000';
// table
const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const index = table.split('').reduce((map, char, idx) => {
  map[char] = idx;
  return map;
}, {});

// encode takes a regular string and encodes as a base64 string
function encode(string) {
  assert.type(string, 'string');
  return fromBinary(bin.toBinary(string));
}

// decode takes a base64 string and decodes as a regular string
function decode(encoded) {
  assert.type(encoded, 'string');
  return bin.toString(toBinary(encoded));
}

// fromBinary takes a binary string and encodes it as a base64 string
function fromBinary(binary) {
  assert.instance(binary, ArrayBuffer);
  let remainder = Math.ceil(binary.byteLength / 3) * 4;
  const encoded = [];
  bin.map(binary, radix, bits => {
    // add padding
    encoded.push(table[bits]);
    remainder--;
  });
  // add padding
  while (remainder > 0) {
    encoded.push('=');
    remainder--;
  }
  return encoded.join('');
}

// toBinary takes a base64 encoded string and returns its unpadded binary representation
function toBinary(base64EncodedString) {
  assert.type(base64EncodedString, 'string');
  // split encoded base64EncodedString and gather bits
  const array = [];
  const length = base64EncodedString.length;
  let offset = 0;
  Array.prototype.forEach.call(base64EncodedString, char => {
    if (char === '=') {
      offset++;
      return;
    }
    array.push(index[char]);
  });
  const byteLength = (length - offset) * radix / octect;
  let binary = bin.fromArray(array);
  return bin.map(binary, octect, x => x, Uint8Array, radix).slice(0, byteLength);
}
