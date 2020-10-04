var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

class Lobby() {
  constructor() {
    this.players = [];
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
}

class Player() {
  constructor(connection, id, username) {
    this.connection = connection;
    this.id = id;
    this.x = 50;
    this.y = 50;
    this.username = username;
  }
}

//lobby code to lobby object mapping
var lobbies = {};
//player id to lobby code mapping
var players = {};

var id = 0;

wss.on('connection', function connection(ws) {
  ws.send('{"idAssign":'+id+'}');
  id++;

  conn.on('message', function incoming(raw) {
    console.log('Received '+raw)
    message = JSON.parse(raw);
    if (message.join !== undefined) {
      if (lobbies[message.join] === undefined) {
        lobbies[message.join] = new Lobby();
      }
      lobbies[message.join].broadcast({joined: {id: message.id, username: message.username}})
      let p = new Player(ws, message.id, message.username);
      lobbies[message.join].addPlayer(p);
      players[message.id] = message.join;
    }
    if (message.x !== undefined && message.y !== undefined) {
      let data = {id: message.id, x: message.x, y: message.y};
      lobbies[players[message.id]].broadcast(data);
    }
  }
});
