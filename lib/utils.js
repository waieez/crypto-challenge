const assert = require('./assert');
const bin = require('./bin');
const hex = require('./hex');
const logger = require('./logger')();

module.exports = {
  analyse,
  countLetters,
  sortFrequency,
  score,
  decodeSingleByteXor,
  detectSingleByteXor,
  repeatingKeyXor
};

const octect = 8;

function repeatingKeyXor(string, key) {
  assert.type(string, 'string');
  assert.type(key, 'string');
  const keyBytes = bin.map(bin.toBinary(key), octect, b => b);
  const xordBinary = bin
    .map(bin.toBinary(string), octect, (byte, idx) =>
      bin.xor(byte, keyBytes[idx % keyBytes.length])
    )
    .join('');

  return bin.toString(xordBinary);
}

const scoreValues = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((map, char) => {
  map[char] = 1;
  return map;
}, {});

function detectSingleByteXor(string) {
  let maxScore = 0;
  let guess = -1;
  let decoded = '';
  // try every character
  for (let cipher = 0; cipher < 256; cipher++) {
    let result = decodeSingleByteXor(string, bin.toBinary(cipher));
    // NOTE: Scoring mechanism is primitive.
    // Will need better solution to actually be useful.
    let score = analyse(result, scoreValues);
    if (score > maxScore) {
      maxScore = score;
      guess = cipher;
      decoded = result;
      logger.debug('Updating guess: ', cipher, score, result);
    }
  }

  return {
    string,
    maxScore,
    guess,
    decoded
  };
}

function decodeSingleByteXor(string, cipher) {
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

// TODO: Change scoring system
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
