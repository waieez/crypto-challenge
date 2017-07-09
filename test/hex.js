const test = require('../lib/test');
const hex = require('../lib/hex');
const logger = require('../lib/logger')();
logger.level = 'error';

module.exports = (() => {
  test('hex.encode', t => {
    const description = 'Should be able to encode a hex string';
    const cases = [
      ['0', '30'],
      ['1', '31'],
      ['hello world', '68656c6c6f20776f726c64']
    ];

    cases.forEach(([input, expectation]) => {
      t.equals(hex.encode(input), expectation, description);
    });
  });

  test('hex.decode', t => {
    const description = 'Should be able to decode a hex string';
    const cases = [['hello world', '68656c6c6f20776f726c64']];

    cases.forEach(([expectation, input]) => {
      t.equals(hex.decode(input), expectation, description);
    });
  });

  test('hex.toBinary', t => {
    const description = 'Should be able to convert a value to binary';
    const cases = [
      ['0', '0000'],
      ['1', '0001'],
      ['2', '0010'],
      ['3', '0011'],
      ['4', '0100'],
      ['5', '0101'],
      ['6', '0110'],
      ['7', '0111'],
      ['8', '1000'],
      ['9', '1001'],
      ['a', '1010'],
      ['b', '1011'],
      ['c', '1100'],
      ['d', '1101'],
      ['e', '1110'],
      ['f', '1111']
    ];
    cases.forEach(([input, expectation]) => {
      t.equals(hex.toBinary(input), expectation, description);
    });
  });
})();
