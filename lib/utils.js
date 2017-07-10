const assert = require('./assert');
const bin = require('./bin');
const hex = require('./hex');
const logger = require('./logger')();

module.exports = {
  analyse,
  countLetters,
  sortFrequency,
  score,
  singleByteXor
};

function singleByteXor(string, cipher) {
  assert.type(string, 'string');
  assert.type(cipher, 'string');
  return string
    .split('')
    .map(char => {
      const binChar = bin.toBinary(char);
      const xChar = bin.toString(bin.xor(binChar, cipher));
      return xChar;
    })
    .join('');
}

// analyse is really stupid
function analyse(string, values) {
  assert.type(string, 'string');
  assert.type(values, 'map', 'number');
  let counts = countLetters(string);
  return score(counts, values);
}

// score is really stupid
function score(counts, values) {
  assert.type(counts, 'map', 'number');
  assert.type(values, 'map', 'number');
  return Object.keys(counts).reduce((sum, char) => {
    char = char.toUpperCase();
    return values[char] ? sum + values[char] * counts[char] : sum;
  }, 0);
}

function countLetters(string) {
  assert.type(string, 'string');
  return string.split('').reduce((counts, char) => {
    char = char.toUpperCase();
    if (!counts[char]) {
      counts[char] = 0;
    }
    counts[char]++;
    return counts;
  }, {});
}

function sortFrequency(counts) {
  assert.type(counts, 'object');
  return Object.keys(counts).sort((a, b) => {
    return counts[a] < counts[b];
  });
}
