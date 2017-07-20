const assert = require('./assert');
const logger = require('./logger')();

module.exports = {
  map,
  last
};

function map(string, step = 1, cb) {
  assert.type(string, 'string');
  assert.type(step, 'number');
  assert.ok(step >= 1, 'Step must be positive.');
  assert.type(cb, 'function');
  const output = [];
  let idx = 0;
  for (var i = 0; i < string.length; i += step) {
    let substring = string.substring(i, i + step);
    output.push(cb(substring, idx++, string));
  }
  return output;
}

function last(array, count = 1) {
  assert.type(array, 'array');
  assert.type(count, 'number');
  assert.ok(count >= 0, 'Count must be positive.');
  const lastValues = [];
  const size = array.length;
  let idx = size - count;
  // skip extra work
  if (idx < 0) {
    count += idx;
    idx = 0;
  }
  while (count > 0) {
    lastValues.push(array[idx++]);
    count--;
  }
  return lastValues;
}
