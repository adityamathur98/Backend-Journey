//Start - Steps to Initialize Database and Server
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const app = express();

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//End - Steps to Initialize Database and Server

//Creat Get Book Api
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
        SELECT *
        FROM book
        ORDER BY book_id;
    `;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
