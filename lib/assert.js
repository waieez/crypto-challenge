module.exports = {
  ok,
  notOk,
  type,
  equals,
  oneOf
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
  console.trace();
  throw message;
}

function notOk(expression, message) {
  if (!check(expression)) {
    return true;
  }
  console.trace();
  throw message;
}

function oneOf(input, group) {
  ok(Array.isArray(group), 'Invalid input. Set must be an array.');
  return ok(
    group.some(item => input === item),
    `Invalid input. Expected ${input} to be member of ${group}.`
  );
}

function type(input, inputType) {
  return ok(
    typeof input === inputType,
    `Invalid input. Expected ${input} to be of type ${inputType}. Got ${typeof input} instead.`
  );
}

function equals(a, b, message) {
  return ok(a === b, message || `Expected ${a} to equal ${b}`);
}
