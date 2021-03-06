module.exports = {
  ok,
  notOk,
  type,
  equals,
  notEquals,
  oneOf,
  instance
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
  type(group, 'array');
  return ok(
    group.some(item => input === item),
    `Invalid input. Expected ${input} to be member of ${group}.`
  );
}

// may want to bring in flow for type checking
// for now still too heavy
function type(input, inputType, valueType, message) {
  message =
    message ||
    `Invalid input. Expected ${input} to be of type ${inputType}. Got ${typeof input} instead.`;
  switch (inputType) {
    case 'array':
      return ok(Array.isArray(input) && valuesType(input, valueType), message);
    case 'map':
      return ok(type(input, 'object') && valuesType(input, valueType), message);
    default:
      return Array.isArray(input)
        ? valuesType(input, inputType)
        : ok(typeof input === inputType, message);
  }
}

function valuesType(values, valueType) {
  ok(values, `Invalid input: ${values} must be truthy`);
  const message = `Invalid input: ${values} . Expected all values to be of type ${valueType}.`;
  if (valueType === undefined) {
    return true;
  }
  if (Array.isArray(values)) {
    return values.every(value => type(value, valueType, null, message));
  }
  return Object.keys(values).reduce((every, key) => {
    return every && type(values[key], valueType, null, message);
  }, true);
}

function equals(a, b, message) {
  return ok(a === b, message || `Expected ${a} to equal ${b}`);
}

function notEquals(a, b, message) {
  return ok(a !== b, message || `Expected ${a} to not equal ${b}`);
}

function instance(input, cnst, message) {
  message = message || `Invalid input. Expected ${input} to be an instance of ${cnst}.`;
  return ok(input instanceof cnst, message);
}
