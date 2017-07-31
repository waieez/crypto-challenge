const assert = require('./assert');
const bin = require('./bin');
const logger = require('./logger')();

module.exports = {
  encode,
  decode,
  fromBinary,
  toBinary
};

const nibble = 4;
const table = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
const index = table.reduce((map, char, idx) => {
  map[char] = idx;
  return map;
}, {});

// encode takes a regular string and encodes as a hex string
function encode(string) {
  assert.type(string, 'string');
  return fromBinary(bin.toBinary(string));
}

// decode takes a hex string and decodes as a regular string
function decode(encoded) {
  assert.type(encoded, 'string');
  return bin.toString(toBinary(encoded));
}

// fromBinary takes a binary string and encodes it as a hex string
function fromBinary(hexBinary) {
  assert.instance(hexBinary, ArrayBuffer);
  const strArray = [];
  bin.map(hexBinary, byte => {
    const [left, right] = getNibbles(byte);
    const leftChar = table[left];
    const rightChar = table[right];
    strArray.push(leftChar, rightChar);
    return byte;
  });
  return strArray.join('');
}

// toBinary takes a hex encoded string and returns its binary representation
function toBinary(hexEncodedString) {
  assert.type(hexEncodedString, 'string');
  const { length } = hexEncodedString;
  let size = Math.floor(length / 2) + length % 2;
  const buffer = new ArrayBuffer(size);
  const hexView = new Uint8Array(buffer);
  let value = -1;
  let reset = false;
  bin.toBinary(hexEncodedString, (dataView, byte, idx) => {
    size = Math.floor(idx / 2);
    const letter = String.fromCharCode(byte).toLowerCase();
    const nibble = index[letter];
    if (value < 0) {
      value = nibble;
      reset = false;
    } else {
      value += nibble << 4;
      reset = true;
    }
    hexView.set([value], size);
    if (reset) {
      value = -1;
    }
  });
  return buffer;
}

function getNibbles(byte) {
  assert.type(byte, 'number');
  assert.ok(byte >= 0, 'Bytes must be positive');
  assert.ok(byte < 256, 'Bytes must not overflow');
  const left = byte >> 4;
  const right = byte ^ (left << 4);
  return [left, right];
}
