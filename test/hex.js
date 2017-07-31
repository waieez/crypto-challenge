const { test, xtest } = require('../lib/test');
const hex = require('../lib/hex');
const logger = require('../lib/logger')();
logger.level = 'error';

module.exports = (() => {
  test('hex.encode', t => {
    const description = 'Should be able to encode a hex string';
    const cases = [['0', '30'], ['1', '31'], ['hello world', '68656c6c6f20776f726c64']];
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
    const cases = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    cases.forEach((input, expectation) => {
      const buffer = hex.toBinary(input);
      t.equals(new Uint8Array(buffer)[0], expectation, description);
    });
  });
})();
