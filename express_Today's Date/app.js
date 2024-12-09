const express = require("express");
const app = express();

app.get("/", (request, response) => {
  let todayDate = new Date();
  let formatted_Date = `${todayDate.getDate()}-${todayDate.getMonth()}-${todayDate.getFullYear()}`;
  response.send(formatted_Date);
});

app.listen(3000);
