const assert = require('./assert');
const bin = require('./bin');
const logger = require('./logger')();

module.exports = {
  encode,
  decode,

  toBinary,
  fromBinary
};

const octect = 8;
const radix = 6;
const emptyBuffer = '000000';
// table
const table =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
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
  assert.type(binary, 'string');
  let remainder = binary.length % 3;
  const encoded = bin.map(binary, radix, bits => {
    // add padding
    bits = bin.rightPad(bits, radix);
    return table[bin.fromBinary(bits)];
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
  let buffers = 0;
  const allBits = base64EncodedString
    .split('')
    .map(char => {
      if (char === '=') {
        buffers++;
        return emptyBuffer;
      }
      let bits = bin.toBinary(index[char]);
      // keep left padding
      return bin.leftPad(bits, radix);
    })
    .join('');

  return allBits.substring(0, allBits.length - buffers * octect);
}
