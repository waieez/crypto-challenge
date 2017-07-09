const assert = require('./assert');
const bin = require('./bin');

module.exports = {
  encode,
  decode,

  toBinary,
  fromBinary,

  toString
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
  return toString(toBinary(encoded));
}

// fromBinary takes a binary string and encodes it as a base64 string
function fromBinary(binary) {
  assert.type(binary, 'string');
  let remainder = binary.length % 3;
  const encoded = bin.map(binary, radix, bits => {
    // add padding
    while (bits.length < radix) {
      bits += '0';
    }
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
  let buffers = 0;
  // split encoded base64EncodedString and gather bits
  const allBits = base64EncodedString
    .split('')
    .map(char => {
      if (char === '=') {
        buffers++;
        return emptyBuffer;
      }
      let bits = bin.toBinary(index[char]);
      // keep left padding
      while (bits.length < radix) {
        bits = '0' + bits;
      }
      return bits;
    })
    .join('');

  return allBits.substring(0, allBits.length - buffers * radix);
}

// toString takes a base64 encoded binary string and returns a string
function toString(base64EncodedBinary) {
  assert.type(base64EncodedBinary, 'string');
  return bin
    .map(
      base64EncodedBinary,
      octect,
      byte =>
        // convert to ASCII discarding partial byte
        // TODO: figure out why it wasn't handed by truncating the binary with the buffers
        (byte.length < radix ? '' : String.fromCharCode(bin.fromBinary(byte)))
    )
    .join('');
}
