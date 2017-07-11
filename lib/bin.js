const assert = require('./assert');
const logger = require('./logger')();

module.exports = {
  map,
  toBinary,
  fromBinary,
  leftPad,
  rightPad,
  toString,
  xor
};

const octect = 8;

function map(binary, radix, cb) {
  assert.type(radix, 'number');
  assert.type(cb, 'function');
  const output = [];
  let idx = 0;
  for (var i = 0; i < binary.length; i += radix) {
    let bits = binary.substring(i, i + radix);
    output.push(cb(bits, idx++, binary));
  }
  return output;
}

// toString takes a binary string and returns a string
function toString(binary) {
  assert.type(binary, 'string');
  return map(binary, octect, byte => String.fromCharCode(fromBinary(byte))).join('');
}

function toBinary(input) {
  assert.oneOf(typeof input, ['string', 'number']);
  switch (typeof input) {
    case 'number':
      return input.toString(2);
    case 'string':
      return stringToBinary(input);
    default:
  }
  return input;
}

function fromBinary(binary) {
  // for now only support base10
  const radix = 10;
  let index = 1;
  let value = 0;
  for (var i = binary.length - 1; i >= 0; i--) {
    if (binary[i] === '1') {
      value += index;
    }
    index *= 2;
  }
  return value;
}

function stringToBinary(input) {
  const output = [];
  for (var i = 0; i < input.length; i++) {
    let bin = input.charCodeAt(i).toString(2);
    while (bin.length < 8) {
      bin = '0' + bin;
    }
    output.push(bin);
  }
  return output.join('');
}

function leftPad(binary, size = octect) {
  assert.type(binary, 'string');
  assert.type(size, 'number');
  while (binary.length < size) {
    binary = '0' + binary;
  }
  return binary;
}

function rightPad(binary, size = octect) {
  assert.type(binary, 'string');
  assert.type(size, 'number');
  while (binary.length < size) {
    binary += '0';
  }
  return binary;
}

function xor(a, b) {
  assert.type(a, 'string');
  assert.type(b, 'string');
  return bitwise(a, b, (A, B) => {
    return A ^ B;
  });
}

// bitwise allows us to work on binary strings longer than 32bits
function bitwise(a, b, cb) {
  assert.ok(a.length, 'Must have a length property');
  assert.ok(b.length, 'Must have a length property');
  assert.type(cb, 'function');
  let aIdx = a.length - 1;
  let bIdx = b.length - 1;
  let size = Math.max(Math.max(aIdx, bIdx), 0);
  let buffer = [];
  while (size >= 0) {
    let A = '0';
    let B = '0';
    if (aIdx >= 0) {
      A = a[aIdx];
    }
    if (bIdx >= 0) {
      B = b[bIdx];
    }
    buffer[size] = cb(A, B);
    aIdx--;
    bIdx--;
    size--;
  }
  return buffer.join('');
}

// TODO: figure out why bitwiseChunks breaks down in blocks > 3
const block = 3;
function bitwiseChunks(a, b, cb) {
  assert.ok(a.length, 'Must have a length property');
  assert.ok(b.length, 'Must have a length property');
  assert.type(cb, 'function');

  let aIdx = a.length;
  let bIdx = b.length;
  let outputLen = Math.max(aIdx, bIdx);
  let size = Math.floor(outputLen / block);
  size = outputLen % block > 0 ? size + 1 : size;
  const buffer = [];
  while (size > 0) {
    let A = '0';
    let B = '0';
    if (aIdx >= 0) {
      let aStart = Math.max(aIdx - block, 0);
      A = a.substring(aStart, aIdx);
    }
    if (bIdx >= 0) {
      let bStart = Math.max(bIdx - block, 0);
      B = b.substring(bStart, bIdx);
    }
    const result = cb(A, B);
    const string = String(result);
    size--;
    buffer[size] = size > 0
      ? leftPad(string, block)
      : leftPad(string, Math.max(A.length, B.length));
    aIdx -= block;
    bIdx -= block;
  }
  return buffer.join('');
}
