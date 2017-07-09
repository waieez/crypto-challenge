const assert = require('./assert');
const { log } = console;

// runner is a simple synchronous test runner
module.exports = function runner(description, testFn) {
  assert.type('function', testFn);
  log();
  log('# ', description);
  const test = new Test();
  testFn(test);
  log();
  test.end();
  log();
};

// Test is a simple class for running tests
class Test {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.count = 0;
  }

  ok(assertion, description) {
    return this._run(() => assert.ok(assertion, description), description);
  }

  notOk(assertion, description) {
    return this._run(() => assert.notOk(assertion, description), description);
  }

  equals(left, right, description) {
    return this._run(
      () => assert.equals(left, right, description),
      description
    );
  }

  _run(assertion, description) {
    assert.type('function', assertion);
    this.count++;
    try {
      assertion();
      pass(description, this.count);
      this.passed++;
    } catch (e) {
      this.failed++;
      if (description && e !== description) {
        fail(description, this.count);
        error(e, this.count);
      } else if (!description) {
        fail(e, this.count);
      }
    }
  }

  end() {
    const { failed } = this;
    if (failed > 0) {
      return fail(failed);
    }
  }
}

function pass(description, count = '') {
  log(count, 'Passed:', description);
}

function fail(description, count = '') {
  log(count, 'Failed:', description);
}

function error(description, count = '') {
  log(count, 'Error:', description);
}
