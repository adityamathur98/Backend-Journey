const getRatio = require("../ratio/index");
const factorialNums = require("../utiliti/factorial/index");

let a = 8,
  b = 4,
  c = 5;

function result(a, b, c) {
  const ratio = getRatio(a, b);
  const factorial = factorialNums(c);

  return { ratio, factorial };
}

console.log(result(8, 4, 5));

module.exports = result;
