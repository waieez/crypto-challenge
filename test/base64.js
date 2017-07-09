const base64 = require('../lib/base64');
const test = require('../lib/test');
const logger = require('../lib/logger')();
logger.level = 'error';

module.exports = (() => {
  const cases = [
    // test cases from wiki
    ['M', 'TQ=='],
    ['Ma', 'TWE='],
    ['any carnal pleasure.', 'YW55IGNhcm5hbCBwbGVhc3VyZS4='],
    ['any carnal pleasure', 'YW55IGNhcm5hbCBwbGVhc3VyZQ=='],
    ['any carnal pleasur', 'YW55IGNhcm5hbCBwbGVhc3Vy'],
    ['any carnal pleasu', 'YW55IGNhcm5hbCBwbGVhc3U='],
    ['any carnal pleas', 'YW55IGNhcm5hbCBwbGVhcw=='],
    ['pleasure.', 'cGxlYXN1cmUu'],
    ['leasure.', 'bGVhc3VyZS4='],
    ['easure.', 'ZWFzdXJlLg=='],
    ['asure.', 'YXN1cmUu'],
    ['sure.', 'c3VyZS4=']
  ];

  test('base64.encode', t => {
    const description = 'Output of encode should match';
    cases.forEach(([input, expected]) => {
      const encoded = base64.encode(input);
      t.equals(encoded, expected, description);
    });
  });

  test('base64.decode', t => {
    const description = 'Output of decode should match';
    cases.forEach(([expected, input]) => {
      const decoded = base64.decode(input);
      t.equals(decoded, expected, description);
    });
  });
})();
