import { arr, myObj, sumOfNum } from "./exportMultipleValues.mjs";

console.log("My Array");

for (let el of arr) {
  console.log(el);
}

console.log("\nPrint Obj");

for (let key in myObj) {
  console.log(`${key} : ${myObj[key]}`);
}

console.log("\nFunction Call Value");

console.log(sumOfNum(5, 6));
