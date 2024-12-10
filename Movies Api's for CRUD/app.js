const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

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

const convertMovieDbObjectToResponseObject = (dbResponse) => {
  return {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbResponse) => {
  return {
    directorId: dbResponse.director_id,
    directorName: dbResponse.director_name,
  };
};

//Create Get Movie Names List Api
app.get("/movies/", async (request, response) => {
  const getMoviesNamesQuery = `
        SELECT movie_name 
        FROM movie;
    `;
  const dbResponse = await database.all(getMoviesNamesQuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Create New Movie Api
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
        INSERT INTO movie (director_id, movie_name,lead_actor)
        VALUES(
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );
    `;
  await database.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Create Get Movies As per Movie Id Api
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//Create Update a Movie Api
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
    UPDATE movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};
  `;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Create Delete Movie Api
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM
            movie
        WHERE
            movie_id = ${movieId};
    `;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Create Get Directors Api
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT *
        FROM director;
    `;
  const dbResponse = await database.all(getDirectorsQuery);
  response.send(
    dbResponse.map((director) =>
      convertDirectorDbObjectToResponseObject(director)
    )
  );
});

//Create Get Movie Names Directate by Specific Director Api
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieuery = `
        SELECT movie_name
        FROM movie
        WHERE director_id = ${directorId};
    `;
  const dbResponse = await database.all(getDirectorMovieuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
