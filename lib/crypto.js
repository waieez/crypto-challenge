const _ = require('./utils');
const assert = require('./assert');
const bin = require('./bin');
const hex = require('./hex');
const logger = require('./logger')();

module.exports = {
  detectSingleByteXor,
  findRepeatingXORKey,
  hammingDistance,
  repeatingKeyXor
};

const englishFrequencies = {
  a: 6.51738,
  b: 1.24248,
  c: 2.17339,
  d: 3.49835,
  e: 10.41442,
  f: 1.97881,
  g: 1.58610,
  h: 4.92888,
  i: 5.58094,
  j: 0.09033,
  k: 0.50529,
  l: 3.31490,
  m: 2.02124,
  n: 5.64513,
  o: 5.96302,
  p: 1.37645,
  q: 0.08606,
  r: 4.97563,
  s: 5.15760,
  t: 7.29357,
  u: 2.25134,
  v: 0.82903,
  w: 1.71272,
  x: 0.13692,
  y: 1.45984,
  z: 0.07836,
  ' ': 19.18182
};

function findRepeatingXORKey(string, max) {
  return findKeys(string, max).reduce(
    (best, guess) => {
      const result = repeatingKeyXor(string, guess);
      const score = analyse(result, englishFrequencies);
      if (score < best.score) {
        best.score = score;
        best.guess = guess;
        logger.info('Updating guessed key:', best);
        logger.info('Decoded output:', result);
      }
      return best;
    },
    {
      guess: '',
      score: Infinity
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
  let bestScore = Infinity;
  let guess = -1;
  let decoded = '';
  // try every character
  for (let cipher = 0; cipher < 256; cipher++) {
    let result = decodeSingleByteXor(string, bin.toBinary(cipher));
    let score = analyse(result, englishFrequencies);
    if (score < bestScore) {
      bestScore = score;
      guess = cipher;
      decoded = result;
      logger.debug('Updating guess: ', cipher, score, result);
    }
  }

  return {
    string,
    bestScore,
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

function analyse(string, languageFrequencies) {
  assert.type(string, 'string');
  assert.type(languageFrequencies, 'map', 'number');
  const counts = countLetters(string);
  return score(counts, string.length, languageFrequencies);
}

function score(counts, total, languageFrequencies) {
  assert.type(counts, 'map', 'number');
  assert.type(languageFrequencies, 'map', 'number');
  return Object.keys(counts).reduce((sum, char) => {
    char = char.toLowerCase();
    // Penalize large differences
    const observed = counts[char] || 0;
    const expected = (languageFrequencies[char] || 0.01) * total;
    return sum + sqDiff(observed, expected);
  }, 0);
}

function sqDiff(observed, expected) {
  return Math.pow((observed - expected) / expected, 2);
}

function countLetters(string) {
  assert.type(string, 'string');
  return string.split('').reduce((counts, char) => {
    char = char.toLowerCase();
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
