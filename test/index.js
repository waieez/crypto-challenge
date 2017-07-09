module.exports = (() => {
  const logger = require('../lib/logger')();
  logger.level = 'error';
  require('./bin');
  require('./base64');
  require('./hex');
})();
