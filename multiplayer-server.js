var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

class Lobby {
  constructor(code) {
    this.players = [];
    this.lobbyCode = code;
    this.gameStarted = false;
    this.scores = {};
  }

  /**
   * Add a player to the lobby.
   */
  addPlayer(player) {
    this.players.push(player);
    this.scores[player.id] = 0;
  }

  /**
   * Send a message to all the players in the lobby
   */
  broadcast(message) {
    var raw = JSON.stringify(message);
    for (var p of this.players) {
      p.connection.send(raw);
    }
  }

  /**
   * Encode the list of players as a JSON.stringify-able array.
   */
  encode() {
    var encoded = [];
    for (var p of this.players) {
      encoded.push(p.encode());
    }
    return encoded;
  }

  /**
   * Update the position of a player stored in its object.
   */
  setPosition(id, x, y) {
    var player = this.players.find((p) => p.id === id);
    player.x = x;
    player.y = y;
  }

  /**
   * Randomly choose a player from those that haven't been chosen yet.
   */
  chooseNextChaser() {
    if (this.idsLeft === undefined) {
      this.idsLeft = this.players.map((p) => p.id);
    }
    return this.idsLeft.pop(Math.floor(Math.random()*this.idsLeft.length));
  }

  /**
   * Broadcast a 'game starting' followed by a 'chosen' message to the
   * lobby, using a random choice of the players not yet selected as
   * the chaser. Automatically runs at intervals using setTimeout.
   */
  startNextRound() {
    let chosen = this.chooseNextChaser();
    if (chosen !== undefined) {
      this.broadcast({
        type: 9, properties: this.gameProperties
      });
      this.gameStarted = true;
      this.broadcast({
        type: 12, id: chosen
      });
      this.currentlyChosen = chosen;
      //+500 to make up for fade in/out transitions
      setTimeout(this.startNextRound.bind(this), (this.gameProperties.roundLength * 1000)+500);
    } else {
      this.broadcast({
        type: 15, scores: this.getScores()
      });
      this.delete();
    }
  }

  /**
   * Send message to player with specific ID.
   */
  sendTo(id, message) {
    var player = this.players.find((p) => p.id === id);
    player.connection.send(JSON.stringify(message));
  }

  /**
   * Get the scores as a list of objects with username and score properties
   */
  getScores() {
    var scores = [];
    for (var p of this.players) {
      scores.push({username: p.username, score: this.scores[p.id]});
    }
    return scores;
  }

  /**
   * Remove lobby from lobbies object and players from players object,
   * as well as closing all player websockets.
   */
  delete() {
    for (var p of this.players) {
      p.connection.close();
      players[p.id] = undefined;
    }
    lobbies[this.lobbyCode] = undefined;
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
          lobbies[message.lobbyCode] = new Lobby(message.lobbyCode);
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
        } else { //if game has already started in lobby
          ws.send('{"type": 0, "error": "Game has already started in this lobby"}');
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
          lobbies[players[message.id]].gameProperties = message.properties;
          lobbies[players[message.id]].startNextRound();
          break;

        case 13: // catch
          lobbies[players[message.id]].broadcast({type:14, id: message.id});
          lobbies[players[message.id]].scores[lobbies[players[message.id]].currentlyChosen]++;
          break;
    }

  });
});
