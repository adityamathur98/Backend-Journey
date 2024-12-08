const factorialNums = (a) => {
  let factorial = 1;
  while (a >= 1) {
    factorial *= a;
    a--;
  }
  return factorial;
};

module.exports = factorialNums;
