module.exports = (() => {
  const logger = require('../lib/logger')();
  logger.level = 'error';
  require('../lib/test').skip(false);
  require('./bin');
  require('./base64');
  require('./hex');
})();
