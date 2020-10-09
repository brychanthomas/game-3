/*
There is a bug where if you try and connect then go back to the main
menu and try again it connects many times.
*/

import { RemotePlayer } from './player.js';
import { GameMap } from './scenes.js';

/**
 * Interface representing an object with the coordinates,
 * id and username of a player.
 */
interface playerObject {
  x: number;
  y: number;
  id: number;
  username: string;
}

/**
 * Interface representing a decoded message from the server.
 */
interface serverMessage {
  type: number;
  idAssign?: number;
  id?: number;
  lobby?: playerObject[];
  velocityX?: number;
  velocityY?: number;
  x?: number;
  y?: number;
  username?: string;
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
  private myid: number;
  private lobbyCode: string;
  private username: string;
  /** List of objects with player IDs, coordinates and usernames. */
  private otherPlayers: playerObject[];
  private scene: GameMap;
  /** List of RemotePlayer instances specific to current scene. */
  private playerSprites: RemotePlayer[];
  private inLobby: boolean;

  constructor() {
    this.playerSprites = [];
    this.inLobby = false;
  }

  /**
   * Connect to a server and join a lobby. Returns a promise.
   */
  join(address: string, lobbyCode: string, username: string) {
    this.lobbyCode = lobbyCode;
    this.username = username;
    return new Promise(function(resolve, reject) {
      this.communicator = new Communicator(address, this.onMessage.bind(this));
      var timeWaited = 0;

      function checkIfConnected() {
        if (this.inLobby) {
          resolve();
        } else {
          timeWaited += 250;
          if (timeWaited >= 5000) {
            reject();
          } else {
            setTimeout(checkIfConnected.bind(this), 250);
          }
        }
      }

      setTimeout(checkIfConnected.bind(this), 250);
    }.bind(this));
  }

  /**
   * Process message from server.
   */
  onMessage(raw: any) {
    var message = <serverMessage>JSON.parse(raw.data);
    switch(message.type) {

      case 1: // ID assign
        this.myid = message.idAssign;
        this.communicator.send({ //send lobby join request
          type: 2, id: this.myid, lobbyCode: this.lobbyCode, username: this.username
        });
        break;

      case 3: // Player listing
        this.otherPlayers = message.lobby;
        this.inLobby = true;
        break

      case 5: // Velocity update from another player
        this.updateRemotePlayer(message);
        break;

      case 6: // New player joined lobby
        this.addNewPlayer(message);
        break;

    }
  }

  /**
   * Adds remote players to a scene.
   */
  setScene(scene: GameMap) {
    this.scene = scene;
    setTimeout(function() {
      for(var player of this.otherPlayers) {
        this.playerSprites.push(new RemotePlayer(player.x, player.y, player.id, this.scene));
      }
    }.bind(this), 1000);
  }

  /**
   * Send the player's current velocity and position.
   */
  sendVelocityAndPosition(velX: number, velY: number, x: number, y: number) {
    this.communicator.send({
      type:5, id: this.myid, velocityX: velX, velocityY: velY, x: x, y: y
    });
  }

  /**
   * Set the position and velocity of a remote player based on
   * a velocity update message.
   */
  updateRemotePlayer(message: serverMessage) {
    if (message.id !== this.myid) {
      var player = this.playerSprites.find((p) => p.id === message.id);
      player.velocityX = message.velocityX;
      player.velocityY = message.velocityY;
      player.x = message.x;
      player.y = message.y;
    }
  }

  /**
   * Adds a new player to the scene based on a new player message.
   */
  addNewPlayer(message: serverMessage) {
    this.otherPlayers.push({
      id: message.id, username: message.username,
      x: message.x, y: message.y
    });
    this.playerSprites.push(new RemotePlayer(message.x, message.y,
      message.id, this.scene));
  }

  /**
   * Delete the remote player sprites and disconnect from the server.
   */
   leave() {
     for (var p of this.playerSprites) {
       p.destroy();
     }
     this.otherPlayers = undefined;
     if (this.communicator !== undefined) {
       this.communicator.close();
     }
     this.inLobby = false;
   }
}
