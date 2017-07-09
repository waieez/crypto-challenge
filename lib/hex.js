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
const table = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f'
];
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
  assert.type(hexBinary, 'string');
  return bin
    .map(hexBinary, nibble, bits => {
      const value = bin.fromBinary(bits);
      return table[value];
    })
    .join('');
}

// toBinary takes a hex encoded string and returns its unpadded binary representation
function toBinary(hexEncodedString) {
  assert.type(hexEncodedString, 'string');
  return hexEncodedString
    .split('')
    .map(char => {
      return bin.leftPad(bin.toBinary(index[char.toLowerCase()]), nibble);
    })
    .join('');
}
