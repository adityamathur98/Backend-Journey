//Start - Steps to Initialize Database and Server
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const app = express();
app.use(express.json());

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

//Create Get Book Api
app.get("/books/", async (request, response) => {
  const {
    offset = 0,
    limit = 10,
    search_q = "",
    order = "ASC",
    order_by = "book_id",
  } = request.query;
  const getBooksQuery = `
        SELECT *
        FROM book
        WHERE title LIKE '%${search_q}%'

        ORDER BY ${order_by} ${order}
        LIMIT ${limit} OFFSET ${offset}; 
    `;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Create Get A Book Api
app.get("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `
    SELECT *
    FROM book
    WHERE book_Id = ${bookId};
    `;
  const book = await db.get(getBookQuery);
  response.send(book);
});

//Create Add Book Api
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
        book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
        (
            '${title}',
            '${authorId}',
            '${rating}',
            '${ratingCount}',
            '${reviewCount}',
            '${description}',
            '${pages}',
            '${dateOfPublication}',
            '${editionLanguage}',
            '${price}',
            '${onlineStores}'
        );`;
  const dbResponse = await db.run(addBookQuery);
  const lastId = dbResponse.lastID;
  response.send({ bookId: lastId });
});

//Create Update Book Api
app.put("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;

  const updateBookQuery = `
    UPDATE 
        book
    SET
        title = '${title}',
        author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
        book_id = ${bookId};
  `;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//Create Delete Book Api
app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
        DELETE FROM book
        WHERE book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

//Create Get Author Book Detail Api
app.get("/authors/:authorId/books", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
        SELECT *
        FROM book
        WHERE author_id = ${authorId};
    `;
  const dbResponse = await db.all(getAuthorBooksQuery);
  response.send(dbResponse);
});
