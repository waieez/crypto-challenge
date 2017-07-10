const assert = require('./assert');

let logger = null;

class Logger {
  constructor(
    config = {
      levels: ['error, log'],
      level: 'log'
    }
  ) {
    assert.type(config.levels, 'array', 'string');
    assert.type(config.level, 'string');
    // fatal, error, warn, info debug
    const self = this;
    this._levels = config.levels.reduce((levels, level, val) => {
      self[level] = self._log.bind(self, level);
      levels[level] = val;
      return levels;
    }, {});

    this._level = config.level;
  }

  set level(v) {
    assert.ok(this._levels[v] !== undefined, 'Cannot set an invalid level');
    this._level = v;
  }

  get level() {
    return this._level;
  }

  _log(level) {
    if (this._levels[level] > this._levels[this.level]) {
      return;
    }
    console.log(`${level}:`, ...Array.prototype.slice.call(arguments, 1));
  }
}

const defaultConfig = {
  levels: ['error', 'warn', 'info', 'debug'],
  level: 'warn'
};

module.exports = function(config = defaultConfig) {
  if (logger) {
    return logger;
  }
  logger = new Logger(config);
  return logger;
};
