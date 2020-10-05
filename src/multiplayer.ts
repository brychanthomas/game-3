import { RemotePlayer } from './player.js';
import { GameMap } from './scenes.js';

interface playerObject {
  x: number;
  y: number;
  id: number;
  username: string;
}

/**
 * Opens a WebSocket connection for sending and receiving
 * data.
 */
class Communicator {

private serverAddress: string;
private websocket: WebSocket;

  constructor(address: string, messageCallback: any) {
    this.serverAddress = address;
    this.websocket = new WebSocket('ws://'+this.serverAddress);
    this.websocket.onmessage = messageCallback;
  }

  send(data: object) {
    this.websocket.send(JSON.stringify(data));
  }

  close() {
    this.websocket.close(1000, "Leaving lobby");
  }
}

/**
 * Creates and manages multiplayer sprites and communication.
 */
export class MultiplayerHandler {

  private communicator: Communicator;
  private playerid: number;
  private lobbyCode: string;
  private username: string;
  private otherPlayers: playerObject[];
  private scene: GameMap;
  private playerSprites: RemotePlayer[];

  constructor() {
    this.playerSprites = [];
  }

  /**
   * Connect to a server and join a lobby. Returns a promise.
   */
  join(address: string, lobbyCode: string, username: string) {
    this.lobbyCode = lobbyCode;
    this.username = username;
    return new Promise(function(resolve: Function, reject: Function) {
      try {
        //try to connect to server
        this.communicator = new Communicator(address, this.onMessage.bind(this));
        var checksCount = 0;
        //check if in lobby every 250ms for max of 3 seconds
        function checkIfJoined() {
          if (this.otherPlayers !== undefined) {
            resolve();
          } else {
            checksCount++;
            if (checksCount > 12) {
              reject('Could not join lobby.');
            } else {
              setTimeout(checkIfJoined.bind(this), 250);
            }
          }
        }
        setTimeout(checkIfJoined.bind(this), 250);
      } catch { //if communicator raised exception
        reject('Failed to connect to server.');
      }
    }.bind(this));
  }

  /**
   * Process message from server.
   */
  onMessage(raw: any) {
    var message = JSON.parse(raw.data);
    console.log(message);
    if (message.idAssign !== undefined) {
      this.playerid = message.idAssign;
      this.communicator.send({id: this.playerid, join: this.lobbyCode, username: this.username});
    } else if (message.lobby !== undefined) {
      this.otherPlayers = message.lobby;
    }
    else if (message.joined) {
      this.otherPlayers.push({id: message.joined.id, x:50, y:50, username: message.joined.username});
      if (this.playerSprites !== undefined) {
        this.playerSprites.push(new RemotePlayer(50, 50, message.joined.id, this.scene));
      }
    }
    else if (message.x !== undefined && message.y !== undefined && message.id !== undefined) {
      if (this.playerSprites !== undefined) {
        let player = this.playerSprites.find(p => p.id === message.id);
        if (player !== undefined) {
          player.x = message.x;
          player.y = message.y;
        }
      }
      let player = this.otherPlayers.find(p => p.id === message.id);
      if (player !== undefined) {
        player.x = message.x;
        player.y = message.y;
      }
    }
  }

  /**
   * Adds remote players to a scene.
   */
  setScene(scene: GameMap) {
    this.scene = scene;
    setTimeout(function() {
      console.log(this.otherPlayers);
      for(var player of this.otherPlayers) {
        this.playerSprites.push(new RemotePlayer(player.x, player.y, player.id, this.scene));
      }
    }.bind(this), 1000);
  }

  /**
   * Send the current position of the player to the server.
   */
  sendPosition(x: number, y: number) {
    this.communicator.send({x: x, y: y, id: this.playerid});
  }

  /**
   * Delete the remote player sprites and disconnect from the server.
   */
   leave() {
     for (var p of this.playerSprites) {
       p.destroy();
     }
     this.otherPlayers = undefined;
     this.communicator.close();
   }
}