module.exports = (() => {
  const logger = require('../lib/logger')();
  logger.level = 'error';
  require('./set-1');
})();
