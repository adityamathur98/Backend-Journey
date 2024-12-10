//Start - Steps to Initialize Database and Server
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

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

//Create Api to return all player in team
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team;
    `;
  const dbResponse = await db.all(getPlayersQuery);
  response.send(dbResponse);
});

//Create Add Player Api
app.post("/players/", async (request, response) => {
  const teamDetails = request.body;
  const { playerName, jerseyNumber, role } = teamDetails;
  const addPlayerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );
  `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//Create Get A Player Deatil Api
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const dbResponse = await db.get(getPlayerDetailQuery);
  response.send(dbResponse);
});

//Create Update Player Detail Api
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  console.log(request.body);

  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Create Delete Player Api
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
  `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
