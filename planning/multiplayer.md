# Multiplayer plan

## Protocol

Every message should have a 'type' property that declares
which type of message it is. Each different type of message
is denoted by a different integer value.

| Type number | Name | Sender | Data | Example |
| ----------- | ---- | ------ | ---- | ------- |
| 0 | Error | Server | error | {type: 0, error: "Lobby is full"} |
| 1 | ID Assign | Server | idAssign | {type: 1, idAssign: 0} |
| 2 | Join request | Client | lobbyCode, id | {type: 2, id: 0, lobbyCode: "cat", username: "walter"} |
| 3 | Player listing | Server | lobby | {type: 3, lobby: [{id: 0, username: "Walter", x: 200, y: 300}]}
| 5 | Velocity update | Client | velocityX, velocityY, x, y, id | {type: 5, id: 0, velocityX: 0, velocityY: 0, x: 200, y: 300} |
| 6 | New player | Server | id, username, x, y | {type: 6, id: 1, username: "rodod",x: 100, y: 100} |
| 7 | Set | Host Client | properties | |
| 8 | Start | Host Client | id, properties | {type: 8, id: 0, properties:  {runnerVision: 1, chaserVision: 2, runnerSpeed: 20, chaserSpeed: 20, roundLength: 30}} |
| 9 | Game starting | Server | properties | {type: 9, properties:  {runnerVision: 1, chaserVision: 2, runnerSpeed: 20, chaserSpeed: 20, roundLength: 30}} |
| 10 | Leave | Client | id | {type: 10, id: 0} |
| 11 | Left | Server | id | {type: 11, id: 0} |
| 12 | Choice | Server | id | {type: 12, id: 1} |
| 13 | Catch | Chosen Client | id | {type: 13, id: 0} |
| 14 | Caught | Server | id | {type: 14, id: 1} |
| 15 | Scores | Server | score for each username | {type: 15, scores: [{username: "walter", score: 4}, {username: "rodod", score: 2}]}

When new players join they are sent a 'player listing' message with
a list of all of the existing players and their last reported
positions. Existing players are send a 'new player' message with
the id of the new player and their username. Their position is not
needed because players spawn in the same place.

The choice message is sent to every player at the start of every round
to confirm who has been selected to be the chaser.

The player with the lowest ID number is the host. This means that the
host can be determined on both the client and server side without sending
any messages and when the host leaves there is a logical successor.

## Client side

There should be a class TheGame that inherits from Phaser.Game and has
a multiplayerHandler property that will then be accessible from all
scenes.

The MultiplayerHandler class will have to be able to connect to the
server and join and leave lobbies, including destroying sprites when
it leaves.

## Server side

The server should ideally be able to tell when a client has been
idle for a while and disconnect them.

It also has to decide which client to choose to be the chaser. When it
receives a catch message it needs to check to ensure that the two
players are actually close to each other. It should then send a caught
message to the player.
