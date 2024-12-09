const express = require("express");
const app = express();

// Home Page Api
app.get("/", (request, response) => {
  response.send("Home Page");
});

//About Page Api
app.get("/about", (request, response) => {
  response.send("About Page");
});

app.listen(3000);

module.exports = app;
