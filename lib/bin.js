const _ = require('./utils');
const assert = require('./assert');
const logger = require('./logger')();

module.exports = {
  fromArray,
  map,
  mapRight,
  toBinary,
  toString,
  xor,
  bitwise,
  countOnes
};

// Helper method to convert a regular array into an ArrayBuffer
function fromArray(array, cb, view = Uint8Array) {
  assert.type(array, 'array');
  assert.type(view, 'function');
  cb && assert.type(cb, 'function');
  const buffer = new ArrayBuffer(array.length);
  const dataView = new view(buffer);
  if (cb) {
    array.reduceRight(cb, dataView);
  } else {
    dataView.set(array);
  }
  return buffer;
}

function toString(binary, cb = byte => String.fromCharCode(byte), view = Uint8Array) {
  assert.instance(binary, ArrayBuffer);
  assert.type(cb, 'function');
  assert.type(view, 'function');
  return new view(binary)
    .reduce((array, byte, idx) => {
      array[idx] = cb(byte, idx, array);
      return array;
    }, [])
    .join('');
}

function toBinary(string, cb = undefined, view = Uint8Array) {
  assert.type(string, 'string');
  assert.type(view, 'function');
  const array = Array.prototype.map.call(string, (char, idx, string) => string.charCodeAt(idx));
  return fromArray(array, cb, view);
}

const octect = 8;
function map(binary, radix = octect, cb = _.identity, view = Uint8Array) {
  assert.instance(binary, ArrayBuffer);
  assert.type(radix, 'number');
  assert.type(cb, 'function');
  assert.type(view, 'function');
  const { BYTES_PER_ELEMENT } = view;
  assert.ok(BYTES_PER_ELEMENT, 'view argument should be a TypedArray');
  const BITS_PER_ELEMENT = BYTES_PER_ELEMENT * octect;
  assert.ok(radix > 0, 'Radix cannot be smaller than 1');
  assert.ok(radix <= BITS_PER_ELEMENT, 'Radix cannot be larger than 8');

  const mapped = [];
  // slice byte from left to right up to radix by creating a mask of all 1's
  // discard the leftmost bits in the mask
  let mask = ones(radix);

  let slice = 0;
  let remainingBits = 0;
  new view(binary).map((bits, idx) => {
    if (remainingBits > 0) {
      // do one iteration here to prevent overflow
      // dump remainder into slice
      slice = remainder << (radix - remainingBits);

      // add leftmost bits from current bits
      discardedBits = BITS_PER_ELEMENT - (radix - remainingBits);
      const leftMost = bits >> discardedBits;

      // add to mapped
      mapped.push(cb(slice | leftMost, mapped.length - 1));

      // set values for next iteration
      remainder = 0;
      remainingBits = BITS_PER_ELEMENT - remainingBits;
      bits = sliceBits(bits, remainingBits);
    } else {
      remainingBits += BITS_PER_ELEMENT;
    }

    let iteration = 1;
    let chunks = remainingBits / radix;
    while (chunks >= 1) {
      // move it down to the least significant section and mask it
      val = chunks === 1 ? bits : bits >> (BITS_PER_ELEMENT - radix * iteration);
      slice = sliceBits(val, radix);
      mapped.push(cb(slice, mapped.length - 1));

      // set values for next iteration
      remainingBits -= radix;
      chunks = remainingBits / radix;
      iteration++;
    }
    remainder = sliceBits(bits, remainingBits);
  });

  return fromArray(mapped);
}

function mapRight(
  binary,
  cb = (prev, current, idx, dataView) => {
    dataView.set([current], idx);
    return dataView;
  },
  view = Uint8Array
) {
  assert.instance(binary, ArrayBuffer);
  assert.type(cb, 'function');
  assert.type(view, 'function');
  const buffer = new ArrayBuffer(binary.byteLength);
  return new view(binary).reduceRight(cb, new view(buffer)).buffer;
}

function bitwise(A, B, cb = _.identity, view = Uint8Array) {
  assert.instance(A, ArrayBuffer);
  assert.instance(B, ArrayBuffer);
  assert.type(cb, 'function');
  assert.type(view, 'function');
  assert.ok(A >= B, 'Invalid. B must be equal to or smaller in length than A');
  const offset = A.byteLength - B.byteLength;
  const bView = new view(B);
  return mapRight(A, (prev, current, currentIdx, dataView) => {
    const result = currentIdx >= offset ? cb(current, bView[currentIdx]) : current;
    dataView.set([result], currentIdx);
    return dataView;
  });
}

function xor(A, B, view = Uint8Array) {
  return bitwise(A, B, (a, b) => a ^ b, view);
}

function everyBit(byte, cb) {
  assert.type(byte, 'number');
  assert.type(cb, 'function');
  for (let i = 0; i < octect; i++) {
    cb(byte % 2, i, byte);
    byte = byte >> 1;
  }
}

function countOnes(byte) {
  assert.type(byte, 'number');
  let count = 0;
  everyBit(byte, bit => count += bit);
  return count;
}

function mostSignificantBit(number) {
  assert.type(number, 'number');
  assert.ok(number >= 0, 'number must be positive');
  let idx = 0;
  while (number !== 0) {
    number = number >> 1;
    idx++;
  }
  return idx;
}

function ones(index) {
  assert.type(index, 'number');
  assert.ok(index >= 0, 'index cannot be less than zero');
  return index > 1 ? Math.pow(2, index) - 1 : index;
}

function createMask(size, rightOffset = 0) {
  assert.type(size, 'number');
  assert.type(rightOffset, 'number');
  return ones(size) << rightOffset;
}

function sliceBits(bits, size = 0, rightOffset = 0) {
  assert.type(bits, 'number');
  assert.type(size, 'number');
  assert.type(rightOffset, 'number');
  assert.ok(size >= 0, 'size cannot be less than zero');
  assert.ok(rightOffset >= 0, 'rightOffset cannot be less than zero');
  bits = bits >> rightOffset;
  const mask = size ? createMask(size) : 0;
  return mask ? bits & mask : bits;
}
