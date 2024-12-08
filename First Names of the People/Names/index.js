const peopleNames = require("../Country/State/City/index");
const getFirstNames = require("../utlities/index");

const getPeopleInCity = (peopleNames) => {
  return getFirstNames(peopleNames);
};

let result = getPeopleInCity(peopleNames);

for (let name of result) {
  console.log(name);
}

module.exports = getPeopleInCity;
