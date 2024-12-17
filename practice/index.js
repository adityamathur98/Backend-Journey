//Start - Steps to Initialize Database and Server
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

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

const logger = (request, response, next) => {
  console.log(request.query);
  next();
};

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

//Register User Api
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hasehdPassword = await bcrypt.hash(password, 10);
  const seletedUserQuery = `
    SELECT *
    FROM user
    WHERE username = '${username}';
  `;
  const dbUser = await db.get(seletedUserQuery);
  if (dbUser == undefined) {
    //Create New User
    const createNewUserQuery = `
      INSERT INTO
        user (username, name, password, gender, location)
      VALUES(
        '${username}',
        '${name}',
        '${hasehdPassword}',
        '${gender}',
        '${location}'
      );
    `;
    await db.run(createNewUserQuery);
    response.send("User Created Successfully..!!!");
  } else {
    //User Already exist
    response.status(400);
    response.send("User Already Exist.");
  }
});

//Login User Api
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const seletedUserQuery = `
    SELECT *
    FROM user
    WHERE username = '${username}';
  `;
  const dbUser = await db.get(seletedUserQuery);

  if (dbUser === undefined) {
    //Invalid User
    response.status(400);
    response.send("Invalid User");
  } else {
    //Check Password
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//Create Get Book Api
app.get("/books/", authenticateToken, async (request, response) => {
  console.log("Get Books Api");
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

//User Profile Api
app.get("/profile/", authenticateToken, async (request, response) => {
  let { username } = request;
  const selectUserQuery = `
    SELECT *
    FROM user
    WHERE username = '${username}';
  `;
  const dbResponse = await db.get(selectUserQuery);
  response.send(dbResponse);
});

//Create Get A Book Api
app.get("/books/:bookId", authenticateToken, async (request, response) => {
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
