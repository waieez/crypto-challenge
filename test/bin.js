const { test, xtest } = require('../lib/test');
const bin = require('../lib/bin');
const logger = require('../lib/logger')();
logger.level = 'error';

module.exports = (() => {
  test('bin.fromArray', t => {
    const bytes = [0, 1, 2, 255];
    const arrayBuffer = bin.fromArray(bytes);
    const view = new Uint8Array(arrayBuffer);
    t.ok(view.every((value, idx) => value === bytes[idx]), 'Output of fromArray should match');
  });

  test('bin.toString', t => {
    const cases = [[33, 33, 33], [88, 88, 88]].map(array => bin.fromArray(array));
    const expected = ['!!!', 'XXX'];
    cases.forEach((binary, idx) =>
      t.equals(bin.toString(binary), expected[idx], 'Should be able to convert a binary to string')
    );
  });

  test('bin.map', t => {
    const cases = [[15], [255], [255, 255], [255, 255, 255]].map(array => bin.fromArray(array));
    const radix = [4, 4, 4, 6];
    const expected = [[0, 15], [15, 15], [15, 15, 15, 15], [63, 63, 63, 63]].map(array =>
      bin.fromArray(array)
    );
    t.ok(
      cases.every((buffer, idx) => {
        const remapped = new Uint8Array(bin.map(buffer, radix[idx])).toString();
        const result = new Uint8Array(expected[idx]).toString();
        return remapped === result;
      }),
      'Should be able to remap a buffer to any arbitrary radix'
    );
  });

  test('bin.toBinary', t => {
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
      [33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 95, 43],
      [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 45, 61],
      [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 123, 125, 124],
      [113, 119, 101, 114, 116, 121, 117, 105, 111, 112, 91, 93, 92],
      [97, 115, 100, 102, 103, 104, 106, 107, 108, 59, 39],
      [65, 83, 68, 70, 71, 72, 74, 75, 76, 58, 34],
      [122, 120, 99, 118, 98, 110, 109, 44, 46, 47],
      [90, 88, 67, 86, 66, 78, 77, 60, 62, 63]
    ];
    cases.forEach((string, idx) => {
      const binary = bin.toBinary(string);
      const result = bin.fromArray(expected[idx]);
      t.equals(
        new Uint8Array(binary).toString(),
        new Uint8Array(result).toString(),
        'Output of toBinary should match'
      );
    });
    logger.levels = 'error';
  });
  test('bin.bitwise + bin.xor', t => {
    const cases = [
      [[1], [0], [1], 'Bitwise should work on binary strings shorter than 32 bits'],
      [[1], [1], [0], 'Bitwise should work on binary strings shorter than 32 bits'],
      [
        // length 40
        [255, 255, 255, 255, 255, 255, 255, 255, 255],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [255, 255, 255, 255, 255, 255, 255, 255, 255],
        'bitwise should work on binary string longer than 32 bits'
      ],
      [
        [255, 255, 255, 255, 255, 255, 255, 255, 255],
        [0],
        [255, 255, 255, 255, 255, 255, 255, 255, 255],
        'bitwise should work on binary strings with different lengths'
      ],
      [
        // 1c0111001f010100061a024b53535009181c
        [28, 1, 17, 0, 31, 1, 1, 0, 6, 26, 2, 75, 83, 83, 80, 9, 24, 28],
        // 686974207468652062756c6c277320657965
        [104, 105, 116, 32, 116, 104, 101, 32, 98, 117, 108, 108, 39, 115, 32, 101, 121, 101],
        // 746865206b696420646f6e277420706c6179
        [116, 104, 101, 32, 107, 105, 100, 32, 100, 111, 110, 39, 116, 32, 112, 108, 97, 121],
        'Crypto Challenge String'
      ]
    ];
    cases.forEach(([a, b, output, description]) => {
      const [A, B] = [a, b].map(array => bin.fromArray(array));
      const xord = bin.xor(A, B);

      t.equals(new Uint8Array(xord).toString(), output.toString(), description);
    });
    logger.level = 'error';
  });
})();
