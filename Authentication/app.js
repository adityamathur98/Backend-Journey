const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "userData.db");
const bcrypt = require("bcrypt");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error : ${error}`);
    process.exit(1);
  }
};

initializeDbAndServer();

function validatePassword(password) {
  if (password.length > 4) {
    return true;
  } else {
    return false;
  }
}

//Api to Register new user
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
    SELECT *
    FROM user
    WHERE username = '${username}';
  `;
  const dbResponse = await db.get(selectUserQuery);

  if (dbResponse === undefined) {
    const createUserQuery = `
        INSERT INTO
            user (username, name, password, gender, location)
        VALUES (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'
        );
    `;
    if (validatePassword(password)) {
      await db.run(createUserQuery);
      response.send("User Created Successfully");
    } else {
      response.status(400);
      response.send("Password is too Short");
    }
  } else {
    response.status(400);
    response.send("User Already Exists!");
  }
});

//Login Api
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
        SELECT *
        FROM user
        WHERE username = '${username}';
    `;
  const dbResponse = await db.get(selectUserQuery);

  if (dbResponse === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      dbResponse.password
    );

    if (isPasswordMatched) {
      response.send("Login Success!!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//Update Password Api
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const selectUserQuery = `
        SELECT *
        FROM user
        WHERE username = '${username}';
    `;
  const dbResponse = await db.get(selectUserQuery);

  if (dbResponse === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      oldPassword,
      dbResponse.password
    );

    if (isPasswordMatched) {
      if (validatePassword(newPassword)) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `
                    UPDATE user
                    SET password = '${hashedPassword}'
                    WHERE username = '${username}';
                `;
        await db.run(updatePasswordQuery);
        response.send("Password Updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    }
  }
});

module.exports = app;
