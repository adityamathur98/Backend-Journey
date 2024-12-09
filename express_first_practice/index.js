const express = require("express");
const app = express();

app.get("/", (request, response) => {
  response.send("Hello World!");
});

app.get("/date", (request, response) => {
  let date = new Date();
  response.send(`Today's date is ${date}`);
});

app.get("/page", (request, response) => {
  response.sendFile("./myapp.html", { root: __dirname });
});

app.listen(3000);
