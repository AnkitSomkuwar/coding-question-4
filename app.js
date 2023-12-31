const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, './cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayers = `
    SELECT * 
    FROM cricket_team ;`
  const playersArray = await db.all(getPlayers)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE 
    player_id = ${playerId};`

  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const playerQuery = `
  INSERT INTO 
  cricket_team (player_name,jersey_number,role)
  values
  (${playerName},'${jerseyNumber}','${role}');`
  await db.run(playerQuery)
  response.send('Player Added to Team')
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updateplayerQuery = `
   UPDATE cricket_team
   SET 
   player_name = '${playerName}',
   jersey_number = ${jerseyNumber},
   role = ${role}
   WHERE 
   player_id = ${playerId};`
  await db.run(updateplayerQuery)
  response.send('Player Details Updated')
})
module.exports = app
