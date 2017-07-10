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

    let maxScore = 0;
    let guess = -1;
    let decoded = '';

    // try every character
    const values = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .split('')
      .reduce((map, char) => {
        map[char] = 1;
        return map;
      }, {});

    const string = hex.decode(hexString);
    for (let cipher = 0; cipher < 256; cipher++) {
      let result = utils.singleByteXor(string, bin.toBinary(cipher));
      // NOTE: Scoring mechanism is primitive.
      // Will need better solution to actually be useful.
      let score = utils.analyse(result, values);
      if (score > maxScore) {
        maxScore = score;
        guess = cipher;
        decoded = result;
        logger.debug('Updating guess: ', cipher, score, result);
      }
    }

    t.ok(guess >= 0, 'Should guess some cipher');
    t.ok(decoded.length > 0, 'Should have some decoded string');

    logger.level = 'info';
    logger.info('Original string: ', hexString); // 1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736
    logger.info('Cipher:', guess); // 88
    logger.info('Decoded string: ', decoded); // Cooking MC's like a pound of bacon
    logger.info('Score: ', maxScore); // 27
    logger.level = 'error';
  });
})();
