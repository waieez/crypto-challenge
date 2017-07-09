const assert = require('./assert');
const { map, toBinary, fromBinary } = require('./binary');

module.exports = {
  encode,
  decode
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

function encode(string) {
  assert.type(string, 'string');
  const binary = toBinary(string);
  let remainder = binary.length % 3;
  const encoded = map(binary, radix, bytes => {
    // add padding
    while (bytes.length < radix) {
      bytes += '0';
    }
    return table[fromBinary(bytes)];
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
  let buffers = 0;
  // split encoded string and gather bytes
  const binary = encoded
    .split('')
    .map(char => {
      if (char === '=') {
        buffers++;
        return emptyBuffer;
      }
      let bytes = toBinary(index[char]);
      // keep left padding
      while (bytes.length < radix) {
        bytes = '0' + bytes;
      }
      return bytes;
    })
    .join('');

  // trim padding from buffers
  const truncatedBinary = binary.substring(0, binary.length - buffers * radix);

  // decode
  return map(
    truncatedBinary,
    octect,
    bytes =>
      // convert to ASCII discarding partial bytes
      // TODO: figure out why it wasn't handed by truncating the binary with the buffers
      (bytes.length < radix ? '' : String.fromCharCode(fromBinary(bytes)))
  ).join('');
}
