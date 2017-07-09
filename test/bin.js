const test = require('../lib/test');
const bin = require('../lib/bin');
module.exports = (() => {
  test('toBinary', t => {
    // faceroll across US keyboard
    const cases = [
      '!@#$%^&*()_+',
      '1234567890-=',
      'QWERTYUIOP{}|',
      'qwertyuiop[]\\',
      "asdfghjkl;'",
      'ASDFGHJKL:"',
      'zxcvbnm,./',
      'ZXCVBNM<>?'
    ];
    const expected = [
      '001000010100000000100011001001000010010101011110001001100010101000101000001010010101111100101011',
      '001100010011001000110011001101000011010100110110001101110011100000111001001100000010110100111101',
      '01010001010101110100010101010010010101000101100101010101010010010100111101010000011110110111110101111100',
      '01110001011101110110010101110010011101000111100101110101011010010110111101110000010110110101110101011100',
      '0110000101110011011001000110011001100111011010000110101001101011011011000011101100100111',
      '0100000101010011010001000100011001000111010010000100101001001011010011000011101000100010',
      '01111010011110000110001101110110011000100110111001101101001011000010111000101111',
      '01011010010110000100001101010110010000100100111001001101001111000011111000111111'
    ];
    cases.forEach((string, idx) => {
      t.equals(
        bin.toBinary(string),
        expected[idx],
        'Output of toBinary should match'
      );
    });
  });

  test('fromBinary', t => {
    const cases = ['0000', '0001', '0010', '100000000'];
    const expected = [0, 1, 2, 256];
    cases.forEach((binary, idx) => {
      t.equals(
        bin.fromBinary(binary),
        expected[idx],
        'Output of fromBinary should match'
      );
    });
  });

  test('map', t => {
    const cases = [
      // binary, radix, output, description
      ['1', 1, ['1'], 'Should work when the length is divisible by the radix'],
      [
        '00001111',
        4,
        ['0000', '1111'],
        'Should work when the length is divisible by the radix'
      ],
      ['1', 2, ['1'], 'Should work when the radix greater than length'],
      [
        '0000001',
        6,
        ['000000', '1'],
        'Should work when the radix greater than length'
      ]
    ];
    cases.forEach(([binary, radix, expected, description], idx) => {
      const result = bin.map(binary, radix, x => x);
      t.ok(result.every((group, idx) => group === expected[idx]), description);
    });
  });
})();
