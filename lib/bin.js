const _ = require('./utils');
const assert = require('./assert');
const logger = require('./logger')();

module.exports = {
  fromArray,
  map,
  mapRight,
  toBinary,
  toString,
  xor
};

// Helper method to convert a regular array into an ArrayBuffer
function fromArray(
  array,
  cb = (dataView, byte, idx) => {
    dataView.set([byte], idx);
    return dataView;
  },
  view = Uint8Array
) {
  assert.type(array, 'array');
  assert.type(cb, 'function');
  assert.type(view, 'function');
  const arrayBuffer = new ArrayBuffer(array.length);
  array.reduceRight(cb, new view(arrayBuffer));
  return arrayBuffer;
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
  const array = Array.prototype.map.call(string, (char, idx, string) => string.charCodeAt(idx));
  return fromArray(array, cb, view);
}

function map(binary, cb = _.identity, view = Uint8Array) {
  assert.instance(binary, ArrayBuffer);
  assert.type(cb, 'function');
  return new view(binary).map(cb);
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
  const b = new view(binary);
  b.reduceRight(cb, b);
  return binary;
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
