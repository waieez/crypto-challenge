const assert = require('./assert');
const { log } = console;

let _skipTests = false;

// runner is a simple synchronous test runner
module.exports = {
  test,
  xtest,
  skip
};

function test(description, testFn) {
  assert.type(description, 'string');
  assert.type(testFn, 'function');
  log();
  log('# ', description);
  const test = new Test();
  testFn(test);
  log();
  test.end();
}

function xtest(description, testFn) {
  assert.type(description, 'string');
  assert.type(testFn, 'function');

  if (!_skipTests) {
    return test(description, testFn);
  }

  log();
  log('## SKIPPED ## ', description);
}

function skip(skipTests) {
  _skipTests = skipTests;
}

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
    return this._run(() => assert.equals(left, right), description);
  }

  notEquals(left, right, description) {
    return this._run(() => assert.notEquals(left, right), description);
  }

  _run(assertion, description = '') {
    assert.type(assertion, 'function');
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
      } else if (!description || e === description) {
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
  log(String(count), 'Passed:', description);
}

function fail(description, count = '') {
  log(String(count), 'Failed:', description);
}

function error(description, count = '') {
  log(String(count), 'Error:', description);
}
