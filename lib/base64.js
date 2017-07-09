const assert = require('./assert');
const { map, toBinary, fromBinary } = require('./binary');

module.exports = {
  encode,
  decode
};

const radix = 6;

function encode(string) {
  assert.type(string, 'string');
  const binary = toBinary(string);
  let remainder = binary.length % 3;
  let padding = 0;
  if (remainder > 0) {
    padding = 3 - remainder;
  }
  const encoded = map(binary, radix, group => {
    // add padding
    while (group.length < radix) {
      group += '0';
    }
    return table[fromBinary(group)];
  });

  // add padding
  while (remainder > 0) {
    encoded.push('=');
    remainder--;
  }
  return encoded.join('');
}

function decode(encoded) {
  assert.type(encoded, 'string');
  // TODO: Implement
  return encoded;
}

// table
const table =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
