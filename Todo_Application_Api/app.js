const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusQueries = (requestObj) => {
  return requestObj.priority !== undefined && requestObj.status !== undefined;
};

const hasPriorityQuery = (requestObj) => {
  return requestObj.priority !== undefined;
};

const hasStatusQuery = (requestObj) => {
  return requestObj.status !== undefined;
};

//Create Api
app.get("/todos/", async (request, response) => {
  let dbResponse = null;
  const { search_q = "", priority, status } = request.query;
  let getTodosQuery = "";
  switch (true) {
    case hasPriorityAndStatusQueries(request.query):
      getTodosQuery = `
          SELECT *
          FROM todo
          WHERE todo LIKE '%${search_q}%'
            AND priority = '${priority}'
            AND status = '${status}';
        `;
      break;
    case hasPriorityQuery(request.query):
      getTodosQuery = `
          SELECT *
          FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}';
        `;
      break;
    case hasStatusQuery(request.query):
      getTodosQuery = `
          SELECT *
          FROM todo
          WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}';
        `;
      break;
    default:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE todo LIKE '%${search_q}%'
    `;
  }

  dbResponse = await database.all(getTodosQuery);
  response.send(dbResponse);
});

//Create Api2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * 
    FROM todo
    WHERE id = ${todoId};
  `;
  const dbResponse = await database.get(getTodoQuery);
  response.send(dbResponse);
});

//Create Add new Todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO 
      todo (id, todo, priority, status)
    VALUES(
      ${id},
      '${todo}',
      '${priority}',
      '${status}'
    );
  `;
  await database.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//Create Update Todo Api
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updatedColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
  }
  const prevTodoQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId};
  `;
  const prevTodo = await database.get(prevTodoQuery);
  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = request.body;
  const updatedQuery = `
    UPDATE todo
    SET
      todo = '${todo}',
      priority = '${priority}',
      status = '${status}'
    WHERE
      id = ${todoId};
  `;
  await database.run(updatedQuery);
  response.send(`${updatedColumn} Updated`);
});

//Create Delete Todo Api
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};
  `;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
