module.exports = (() => {
  const logger = require('../lib/logger')();
  logger.level = 'error';
  require('../lib/test').skip(true);
  require('./set-1');
})();
