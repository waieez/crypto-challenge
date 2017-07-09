module.exports = function toBinary(input) {
  switch (typeof input) {
    case 'string':
      return stringToBinary(input);
    default:
  }
  return input;
};

function stringToBinary(input) {
  const output = [];
  for (var i = 0; i < input.length; i++) {
    let bin = input.charCodeAt(i).toString(2);
    while (bin.length < 8) {
      bin = '0' + bin;
    }
    output.push(bin);
  }
  return output.join('');
}
