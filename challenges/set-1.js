const assert = require('../lib/assert');
const base64 = require('../lib/base64');
const bin = require('../lib/bin');
const hex = require('../lib/hex');
const logger = require('../lib/logger')();
const test = require('../lib/test');
const utils = require('../lib/utils');

logger.level = 'error';

module.exports = (() => {
  test('1 - Convert Hex to Base64', t => {
    const input =
      '49276d206b696c6c696e6720796f757220627261696e206c696b65206120706f69736f6e6f7573206d757368726f6f6d';
    const output =
      'SSdtIGtpbGxpbmcgeW91ciBicmFpbiBsaWtlIGEgcG9pc29ub3VzIG11c2hyb29t';

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
    const hexString =
      '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736';

    const string = hex.decode(hexString);
    const { maxScore, guess, decoded } = utils.detectSingleByteXor(string);

    t.ok(guess >= 0, 'Should guess some cipher');
    t.ok(decoded.length > 0, 'Should have some decoded string');

    logger.level = 'info';
    logger.info('Original string: ', hexString); // 1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736
    logger.info('Cipher:', guess); // 88
    logger.info('Decoded string: ', decoded); // Cooking MC's like a pound of bacon
    logger.info('Score: ', maxScore); // 27
    logger.level = 'error';
  });

  test('4 - Detect single-character XOR', t => {
    const data = require('../data/single-char-xor');

    let bestResult = {
      string: '',
      maxScore: 0,
      guess: -1,
      decoded: ''
    };

    logger.debug('type of data', assert.type(data, 'array', 'string'));
    data.forEach(hexString => {
      const string = hex.decode(hexString);
      const result = utils.detectSingleByteXor(string);
      if (result.maxScore > bestResult.maxScore) {
        bestResult = result;
        logger.debug('Updating bestResult', result);
      }
    });

    const { string, guess, maxScore, decoded } = bestResult;
    t.ok(guess >= 0, 'Should guess some cipher');
    t.ok(decoded.length > 0, 'Should have some decoded string');

    logger.level = 'info';
    logger.info('Original string: ', string);
    logger.info('Cipher:', guess);
    logger.info('Decoded string: ', decoded); // nOWTHATTHEPARTYISJUMPING*
    logger.info('Score: ', maxScore);
    logger.level = 'error';
  });
})();
