const assert = require('assert');

module.exports = {
  encode,
  decode,
  fromBinary,
  toBinary
};

// encode takes a regular string and encodes as a hex string
function encode(string) {
  assert.type(string, 'string');
}

// decode takes a hex string and decodes as a regular string
function decode(encoded) {
  assert.type(string, 'string');
}

// fromBinary takes a binary string and encodes it as a hex string
function fromBinary(binary) {
  assert.type(binary, 'string');
}

// toBinary takes a hex encoded string and returns its unpadded binary representation
function toBinary(hexEncodedString) {
  assert.type(hexEncodedString, 'string');
}

// toString takes a hex encoded binary string and returns a string
function toString(hexBinary) {
  assert.type(hexBinary, 'string');
}
