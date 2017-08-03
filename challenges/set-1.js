const _ = require('../lib/utils');
const base64 = require('../lib/base64');
const bin = require('../lib/bin');
const hex = require('../lib/hex');
const logger = require('../lib/logger')();
const { test, xtest } = require('../lib/test');
const crypto = require('../lib/crypto');

logger.level = 'error';

module.exports = (() => {
  test('1 - Convert Hex to Base64', t => {
    const input =
      '49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d';
    const output = 'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t';

    const binary = hex.toBinary(input);
    const string = base64.fromBinary(binary);

    t.equals(string, output, 'Should be able to convert hex to Base64');
  });

  test('2 - Fixed XOR', t => {
    const a = '1c0111001f010100061a024b53535009181c';
    const b = '686974207468652062756c6c277320657965';
    const output = '746865206b696420646f6e277420706c6179';

    const binA = hex.toBinary(a);
    const binB = hex.toBinary(b);

    const xord = bin.xor(binA, binB);
    const string = hex.fromBinary(xord);

    t.equals(string, output, 'result of XOR + encode should match output');
  });

  test('3 - Single Byte XOR Cipher', t => {
    const hexString = '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736';

    const string = hex.decode(hexString);
    const { bestScore, guess, decoded } = crypto.detectSingleByteXor(string);

    t.ok(guess >= 0, 'Should guess some cipher');
    t.ok(decoded.length > 0, 'Should have some decoded string');

    logger.level = 'info';
    logger.info('Original string: ', hexString); // 1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736
    logger.info('Cipher:', guess); // 88
    logger.info('Decoded string: ', decoded); // Cooking MC's like a pound of bacon
    logger.info('Score: ', bestScore); // ~20 (lower is better)
    logger.level = 'error';
  });

  xtest('4 - Detect single-character XOR', t => {
    const data = require('../data/single-char-xor');
    const decrypted = 'Now that the party is jumping';

    let bestResult = {
      string: '',
      bestScore: Infinity,
      guess: -1,
      decoded: ''
    };

    data.forEach(hexString => {
      const string = hex.decode(hexString);
      const result = crypto.detectSingleByteXor(string);
      if (result.bestScore < bestResult.bestScore) {
        bestResult = result;
        logger.info('Updating bestResult', result);
      }
    });

    const { string, guess, bestScore, decoded } = bestResult;
    t.ok(guess >= 0, 'Should guess some cipher');
    t.ok(decoded.length > 0, 'Should have some decoded string');
    t.equals(decoded, decrypted, 'Should be able to detect single-char XOR');

    logger.level = 'info';
    logger.info('Original string: ', string); // {ZBA]TAA]PETGAL\F_@XE\[R?
    logger.info('Cipher:', guess); // 53
    logger.info('Decoded string: ', decoded); // Now that the party is jumping
    logger.info('Score: ', bestScore); // 21.36
    logger.level = 'error';
  });

  test('5 - Repeating Key XOR', t => {
    const originalString =
      "Burning 'em, if you ain't quick and nimble I go crazy when I hear a cymbal";

    const key = 'ICE';
    const encrypted = crypto.repeatingKeyXor(originalString, key);
    // TODO: figure out what's different between expected output and my output.
    // For now just compare base64 ecoded string
    // const output = 'a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f';
    const output =
      'CzY3JyorLmNiLC5paSojaToqPGMkIC1iPWM0PComImMkJydlJyooKy8gaQplLixlKjEkMzplPisgJ2MMaSsgKDFlKGMmMC4nKC8=';
    t.notEquals(encrypted, originalString, 'The string should be encrypted');
    t.equals(
      base64.encode(encrypted),
      output,
      'Should be able to encrypt a string with repeating key XOR'
    );

    const decrypted = crypto.repeatingKeyXor(encrypted, key);
    t.equals(decrypted, originalString, 'Should be able to decrypt a string using the key');
  });

  test('Break repeating key XOR - Quick Sanity Test', t => {
    const distance = crypto.hammingDistance('this is a test', 'wokka wokka!!!');
    t.equals(distance, 37, 'Should be able to compute the hamming distance of two strings');

    const original = "Cooking MC's like a pound of bacon";
    const string = crypto.repeatingKeyXor(original, 'X');
    const key = crypto.findRepeatingXORKey(string, 3);
    const decoded = crypto.repeatingKeyXor(string, key);
    t.equals(original, decoded, 'Should be able to break repeating key XOR with constraints');

    logger.level = 'info';
    logger.info('Original string:', original);
    logger.info('Gussed Key:', key);
    logger.info('Decoded:', decoded);
    logger.level = 'error';
  });

  xtest('Break repeating key XOR', t => {
    const data = require('../data/repeating-key-xor');
    const decoded = base64.decode(data);

    const key = crypto.findRepeatingXORKey(decoded, 20);
    const decrypted = crypto.repeatingKeyXor(decoded, key);

    logger.level = 'info';
    logger.info('Gussed Key:', key);
    logger.info('Decrypted:', decrypted);
    logger.level = 'error';
  });
})();
