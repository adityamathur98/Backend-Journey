const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

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

function convertPlayerDbObjToResultObj(playerObj) {
  return {
    playerId: playerObj.player_id,
    playerName: playerObj.player_name,
  };
}

function convertMatchDbObjToResultObj(matchObj) {
  return {
    matchId: matchObj.match_id,
    match: matchObj.match,
    year: matchObj.year,
  };
}

//Create Get Players Api
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM player_details;
    `;
  const dbResponse = await database.all(getPlayersQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertPlayerDbObjToResultObj(eachPlayer))
  );
});

//Create Get a Player Api
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT *
        FROM player_details
        WHERE player_id = ${playerId};
    `;
  const dbResponse = await database.get(getPlayerQuery);
  response.send(convertPlayerDbObjToResultObj(dbResponse));
});

//Create Update Player Api
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
        UPDATE player_details
        SET
            player_name = '${playerName}'
        WHERE
            player_id = ${playerId};
    `;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Create Get Matches Details Api
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesQuery = `
        SELECT *
        FROM match_details
        WHERE match_id = ${matchId};
    `;
  const dbResponse = await database.get(getMatchesQuery);
  response.send(convertMatchDbObjToResultObj(dbResponse));
});

//Create Matches of a Player Api
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
        SELECT 
            *
        FROM 
            match_details 
                NATURAL JOIN
            player_match_score
        WHERE
            player_id = ${playerId};
    `;
  const dbResponse = await database.all(getPlayerMatchesQuery);
  response.send(
    dbResponse.map((eachMatch) => convertMatchDbObjToResultObj(eachMatch))
  );
});

//Create Players of A Match Api
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
        SELECT *
        FROM 
            player_match_score
                NATURAL JOIN
            player_details
        WHERE
            match_id = ${matchId};
    `;
  const dbResponse = await database.all(getMatchPlayersQuery);
  response.send(
    dbResponse.map((eachPlayer) => convertPlayerDbObjToResultObj(eachPlayer))
  );
});

//Create Statistics of a Player Api
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerStatsQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName,
            SUM(score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM
            player_match_score
                NATURAL JOIN
            player_details
        WHERE
            player_id = ${playerId};
    `;
  const dbResponse = await database.get(getPlayerStatsQuery);
  response.send(dbResponse);
});

module.exports = app;
