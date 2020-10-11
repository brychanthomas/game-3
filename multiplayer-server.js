var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

class Lobby {
  constructor() {
    this.players = [];
    this.gameStarted = false;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  broadcast(message) {
    var raw = JSON.stringify(message);
    for (var p of this.players) {
      p.connection.send(raw);
    }
  }

  encode() {
    var encoded = [];
    for (var p of this.players) {
      encoded.push(p.encode());
    }
    return encoded;
  }

  setPosition(id, x, y) {
    var player = this.players.find((p) => p.id === id);
    player.x = x;
    player.y = y;
  }

  chooseNextChaser() {
    if (this.idsLeft === undefined) {
      this.idsLeft = this.players.map((p) => p.id);
    }
    return this.idsLeft.pop(Math.floor(Math.random()*this.idsLeft.length));
  }
}

class Player {
  constructor(connection, id, username) {
    this.connection = connection;
    this.id = id;
    this.x = 100;
    this.y = 100;
    this.username = username;
  }

  encode() {
    return {id: this.id, x: this.x, y: this.y, username: this.username}
  }
}

//lobby code to lobby object mapping
var lobbies = {};
//player id to lobby code mapping
var players = {};

var id = 0;

wss.on('connection', function connection(ws) {
  ws.send('{"type": 1, "idAssign":'+id+'}');
  console.log("ID", id, "connected");
  id++;

  ws.on('message', function incoming(raw) {
    console.log('Received '+raw)
    message = JSON.parse(raw);
    switch(message.type) {

      case 2: //lobby join request
        if (lobbies[message.lobbyCode] === undefined) {
          lobbies[message.lobbyCode] = new Lobby();
        }
        if (!lobbies[message.lobbyCode].gameStarted) {
          lobbies[message.lobbyCode].broadcast({ //new player
            type: 6, id: message.id, username: message.username, x: 100, y: 100
          });
          ws.send(JSON.stringify({ //player listing
            type: 3, lobby: lobbies[message.lobbyCode].encode()
          }));
          lobbies[message.lobbyCode].addPlayer(new Player(ws, message.id, message.username));
          players[message.id] = message.lobbyCode;
        } else {
          ws.close();
        }
        break;

        case 5: // velocity update
          lobbies[players[message.id]].broadcast({
            type: 5, id: message.id, velocityX: message.velocityX,
            velocityY: message.velocityY, x: message.x, y: message.y
          });
          lobbies[players[message.id]].setPosition(message.id, message.x, message.y);
          break;

        case 8: // start game
          lobbies[players[message.id]].broadcast({
            type: 9
          });
          lobbies[players[message.id]].gameStarted = true;
          let chosen = lobbies[players[message.id]].chooseNextChaser();
          lobbies[players[message.id]].broadcast({
            type: 12, id: chosen
          });
          break;
    }

  });
});
