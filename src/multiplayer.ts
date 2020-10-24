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
 * Interface representing object of game properties set by host.
 */
interface gameProperties {
  chaserVision: number;
  runnerVision: number;
  chaserSpeed: number;
  runnerSpeed: number;
  roundLength: integer;
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
  error?: string;
  properties?: gameProperties;
  scores?: Object[];
}

/**
 * Opens a WebSocket connection for sending and receiving
 * data.
 */
class Communicator {

private serverAddress: string;
private websocket: WebSocket;
public  error: any;

  constructor(address: string, messageCallback: any) {
    this.serverAddress = address;
    this.websocket = new WebSocket('ws://'+this.serverAddress);
    this.websocket.onmessage = messageCallback;
    this.websocket.onerror = function(err: any) {this.error = err}.bind(this);
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
  /** List of objects representing the other players. */
  private scene: GameMap;
  /** List of RemotePlayer instances specific to current scene. */
  private playerSprites: RemotePlayer[];
  /** Whether the player has successfully joined a lobby yet. */
  private inLobby: boolean;
  /** Whether the local player is the game host or not. */
  public  amHost : boolean;
  /** The ID of the player that is currently the chaser. */
  private currentlyChosen: number;
  /** Whether or not the local player is the chaser. */
  public  amChosen: boolean;
  /** Whether the local player has been caught yet this round. */
  public  amCaught: boolean;
  /** The last error message sent by the server. */
  private error: string;
  /** Object containing speed and vision radius for runner and chaser. */
  public  gameProperties: gameProperties;

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
    this.error = undefined;
    return new Promise(function(resolve, reject) {
      this.communicator = new Communicator(address, this.onMessage.bind(this));
      var timeWaited = 0;

      function checkIfConnected() {
        if (this.inLobby) {
          resolve();
        } else {
          timeWaited += 250;
          if (this.communicator.error !== undefined) {
            reject("Unable to connect - server is probably down or doesn't exist.");
          } else if (this.error !== undefined) {
            reject("Server error: " + this.error);
          }
          if (timeWaited >= 5000) {
            reject("Timeout error - did not join lobby within 5 seconds.");
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

      case 0:
        this.error = message.error;
        break;

      case 1: // ID assign
        this.myid = message.idAssign;
        this.communicator.send({ //send lobby join request
          type: 2, id: this.myid, lobbyCode: this.lobbyCode, username: this.username
        });
        break;

      case 3: // Player listing
        this.otherPlayers = message.lobby;
        this.inLobby = true;
        let hostId = this.otherPlayers.reduce((m, c) => m = Math.min(m, c.id), this.myid);
        this.amHost = (hostId === this.myid);
        break

      case 5: // Velocity update from another player
        this.updateRemotePlayer(message);
        break;

      case 6: // New player joined lobby
        this.addNewPlayer(message);
        break;

      case 9: // Game starting
        this.gameProperties = message.properties;
        this.scene.startGameScene();
        break;

      case 12: // Choice
        this.currentlyChosen = message.id;
        this.amChosen = (this.currentlyChosen === this.myid);
        this.amCaught = false;
        break;

      case 14: // Caught
        if (message.id === this.myid) {
          this.amCaught = true;
        } else {
          var player = this.playerSprites.find((p) => p.id === message.id);
          player.visible = false;
        }
        break;

      case 15: // Scores
        this.scene.scene.start('score', message.scores);
        break;
    }
  }

  /**
   * Adds remote players to a scene.
   */
  setScene(scene: GameMap) {
    this.scene = scene;
    this.playerSprites = [];
    setTimeout(function() {
      for(var player of this.otherPlayers) {
        //spawn at (100, 100) if round started or server specified coords if in holding area
        let x = (this.gameStarted) ? 100 : player.x;
        let y = (this.gameStarted) ? 100 : player.y;
        this.playerSprites.push(new RemotePlayer(x, y, player.id, player.username, this.scene));
        if (player.id === this.currentlyChosen) {
          this.playerSprites[this.playerSprites.length-1].chosen();
        }
      }
    }.bind(this), 200);
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
      if (player !== undefined) {
        player.velocityX = message.velocityX;
        player.velocityY = message.velocityY;
        player.x = message.x;
        player.y = message.y;
      }
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
      message.id, message.username, this.scene));
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
       this.communicator = undefined;
     }
     this.inLobby = false;
     this.currentlyChosen = undefined;
     this.scene = undefined;
   }

   /**
    * Send a message to tell the server to start the game when in
    * holding area. Only has any effect if you are host and are in
    * holding area.
    */
   sendStartMessage() {
     if (this.amHost) {
       this.communicator.send({
         type: 8, id: this.myid, properties: {
           runnerVision: Number((<HTMLInputElement>document.getElementById("runnerVision")).value),
           chaserVision: Number((<HTMLInputElement>document.getElementById("chaserVision")).value),
           runnerSpeed: Number((<HTMLInputElement>document.getElementById("runnerSpeed")).value),
           chaserSpeed: Number((<HTMLInputElement>document.getElementById("chaserSpeed")).value),
           roundLength: Number((<HTMLInputElement>document.getElementById("roundLength")).value),
         }
       });
     }
   }

   /**
    * Update the position of all the remote players' nametags.
    */
   updateNametags() {
     this.playerSprites.forEach((p) => p.updateNametag());
   }

  /**
  * Called when space pressed. If local player is the catcher and is
  * within required distance of other player, sends a 'catch' message
  * to the server with the other player's ID.
  */
  catch(playerX: number, playerY: number) {
    if (this.amChosen) {
      let closestDist = Infinity;
      let closestId = -1;
      this.playerSprites.forEach(function(p) {
        if (Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y) < closestDist) {
          closestDist = Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y);
          closestId = p.id;
        }
      });
      if (closestDist < 80) {
        this.communicator.send({
          type: 13, id: closestId
        });
      }
    }
  }

  /**
   * Returns true if the game has started, false if the player's
   * still in the holding area.
   */
  get gameStarted() {
    return this.currentlyChosen !== undefined;
  }
}
