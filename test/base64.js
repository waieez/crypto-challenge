const base64 = require('../lib/base64');
const test = require('../lib/test');
module.exports = (() => {
  test('base64.encode', t => {
    const description = 'Output of encode should match';
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
    cases.forEach(([input, expected]) => {
      const encoded = base64.encode(input);
      t.equals(encoded, expected, description);
    });
  });
})();
