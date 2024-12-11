const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

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

const convertDbObjectToResultObject = (stateObj) => {
  return {
    stateId: stateObj.state_id,
    stateName: stateObj.state_name,
    population: stateObj.population,
  };
};

const convertDistrictDbObjectToResultObject = (districtObj) => {
  return {
    districtId: districtObj.district_id,
    districtName: districtObj.district_name,
    stateId: districtObj.state_id,
    cases: districtObj.cases,
    cured: districtObj.cured,
    active: districtObj.active,
    deaths: districtObj.deaths,
  };
};

//Create Get State Details Api
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
        SELECT *
        FROM state;
    `;
  const dbResponse = await database.all(getStatesQuery);
  response.send(
    dbResponse.map((eachState) => convertDbObjectToResultObject(eachState))
  );
});

//Create Get State based on ID Api
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
        SELECT *
        FROM state
        WHERE state_id = ${stateId};
    `;
  const dbResponse = await database.get(getStateQuery);
  response.send(convertDbObjectToResultObject(dbResponse));
});

//Create Add District Api
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrictQuery = `
        INSERT INTO
            district (district_name,state_id,cases,cured,active,deaths)
        VALUES(
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
        );
    `;
  await database.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//Create Get District based on ID Api
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictuery = `
        SELECT *
        FROM district
        WHERE district_id = ${districtId};
    `;
  const dbResponse = await database.get(getDistrictuery);
  response.send(convertDistrictDbObjectToResultObject(dbResponse));
});

//Create Delete District Api
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
        DELETE FROM
            district
        WHERE
            district_id = ${districtId};
    `;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//Create Update District Api
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `
        UPDATE district
        SET
            district_name = '${districtName}',
            state_id = ${stateId},
            cured = ${cured},
            active = ${active},
            deaths = ${deaths}
        WHERE
            district_id = ${districtId};
    `;
  await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//Create Statistics of Covid Cases of a State Api
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatisticsQuery = `
        SELECT 
            SUM(cases),
            SUM(cured),
            SUM(active),
            SUM(deaths)
        FROM 
            district
        WHERE
            state_id = ${stateId};
    `;
  const dbResponse = await database.get(getStatisticsQuery);
  response.send({
    totalCases: dbResponse["SUM(cases)"],
    totalCured: dbResponse["SUM(cured)"],
    totalActive: dbResponse["SUM(active)"],
    totalDeaths: dbResponse["SUM(deaths)"],
  });
});

//Create State Name of District Api
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
