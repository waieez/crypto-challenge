const _ = require('./underscore');
const assert = require('./assert');
const bin = require('./bin');
const hex = require('./hex');
const logger = require('./logger')();

module.exports = {
  analyse,
  countLetters,
  decodeSingleByteXor,
  detectSingleByteXor,
  findRepeatingXORKey,
  findKeySize,
  hammingDistance,
  repeatingKeyXor,
  score,
  sortFrequency
};

const scoreValues = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').reduce((map, char) => {
  map[char] = 1;
  return map;
}, {});

function findRepeatingXORKey(string, max) {
  return findKeys(string, max).reduce(
    (best, guess) => {
      const result = repeatingKeyXor(string, guess);
      const score = analyse(result, scoreValues);
      if (score > best.score) {
        best.score = score;
        best.guess = guess;
        logger.debug('Updating guessed key:', best, result);
      }
      return best;
    },
    {
      guess: '',
      score: -1
    }
  ).guess;
}

function findKeys(string, max) {
  const keySizes = findKeySize(string, max);
  const smallest = keySizes.slice(-5);
  const guessedKeys = [];
  while (smallest.length > 0) {
    let keySize = smallest.pop();
    const guessedKey = transpose(string, keySize)
      .map(block => {
        const str = block.join('');
        const result = detectSingleByteXor(str);
        return String.fromCharCode(result.guess);
      })
      .join('');
    guessedKeys[smallest.length] = guessedKey;
  }
  logger.debug('The guessed keys are', guessedKeys);
  return guessedKeys;
}

function transpose(string, keySize) {
  let transposed = [];
  _.map(string, Number(keySize), substring => {
    substring.split('').forEach((char, idx) => {
      if (!Array.isArray(transposed[idx])) {
        transposed[idx] = [];
      }
      transposed[idx].push(char);
    });
  });
  return transposed;
}

function findKeySize(string, maxSize) {
  assert.type(string, 'string');
  assert.type(maxSize, 'number');
  let smallestDistance = Infinity;
  const keySizes = {};
  for (var keySize = 1; keySize <= maxSize; keySize++) {
    if (string.length < keySize * 2) {
      logger.debug(`Provided string ${string} is too short for keySize ${keySize}`);
      break;
    }
    let distance = normalizedEditDistance(string, keySize);
    keySizes[keySize] = distance;
  }
  const sorted = Object.keys(keySizes).sort((a, b) => {
    return keySizes[a] < keySizes[b];
  });
  return sorted;
}

function normalizedEditDistance(string, keySize) {
  assert.type(string, 'string');
  assert.type(keySize, 'number');
  assert.ok(string.length > keySize * 2, 'Invalid input, string is too short or keySize too large');

  const a = string.substring(0, keySize);
  const b = string.substring(keySize, keySize * 2);
  return hammingDistance(a, b) / keySize;
}

function hammingDistance(a, b) {
  assert.type(a, 'string');
  assert.type(b, 'string');
  const [binA, binB] = [a, b].map(bin.toBinary);
  const xored = bin.xor(binA, binB);
  let sum = 0;
  for (var i = 0; i < xored.length; i++) {
    if (xored[i] === '1') {
      sum++;
    }
  }
  return sum;
}

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

function detectSingleByteXor(string) {
  assert.type(string, 'string');
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
