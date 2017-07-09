module.exports = {
  ok,
  notOk,
  type,
  equals
};

function check(expression) {
  if (typeof expression === 'function') {
    return expression();
  }
  return expression;
}

function ok(expression, message) {
  if (check(expression)) {
    return true;
  }
  throw message;
}

function notOk(expression, message) {
  if (!check(expression)) {
    return true;
  }
  throw message;
}

function type(input, inputType) {
  return ok(
    typeof input === inputType,
    `Invalid input. Expected ${input} to be of type ${inputType}`
  );
}

function equals(a, b, message) {
  return ok(a === b, message || `Expected ${a} to equal ${b}`);
}
