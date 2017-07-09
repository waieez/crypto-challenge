const assert = require('./assert');

module.exports = {
  map,
  toBinary,
  fromBinary
};

function map(binary, radix, cb) {
  assert.type(radix, 'number');
  assert.type(cb, 'function');
  const output = [];
  for (var i = 0; i < binary.length; i += radix) {
    output.push(cb(binary.substring(i, i + radix)));
  }
  return output;
}

function toBinary(input) {
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
