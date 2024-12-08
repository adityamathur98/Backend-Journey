const person = require("./exportObject");

for (let key in person) {
  console.log(`${key} : ${person[key]}`);
}
