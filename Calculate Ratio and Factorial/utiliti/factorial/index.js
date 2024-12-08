const factorialNums = (a) => {
  let product = 1;
  for (let i = 1; i <= a; i++) {
    product *= i;
  }
  return product;
};

module.exports = factorialNums;
