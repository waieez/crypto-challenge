const base64 = require('../lib/base64');
const bin = require('../lib/bin');
const hex = require('../lib/hex');
const logger = require('../lib/logger')();
const test = require('../lib/test');

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
})();
