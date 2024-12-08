const { addDays } = require("date-fns");
let days = 10;

function newDate(days) {
  let newDate = addDays(new Date("22 Aug 2022"), days);
  return `${newDate.getDate()}-${
    newDate.getMonth() + 1
  }-${newDate.getFullYear()}`;
}

module.exports = newDate;
