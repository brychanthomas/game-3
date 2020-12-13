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
  waitTime: integer;
  roundLength: integer;
  map: number;
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
  chosen?: number;
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
 * Creates RemotePlayers and updates their positions
 */
class RemotePlayerManager {

  private players: RemotePlayer[] = [];

  /**
   * Add a new player to the scene.
   */
  add(x: number, y: number, id: number, username: string, scene: GameMap) {
    this.players.push(new RemotePlayer(x, y, id, username, scene));
  }

  /**
   * Remove player with specific ID from scene
   */
  remove(id: number) {
    var player = this.players.find((p) => p.id === id);
    player.destroy();
    this.players.splice(this.players.findIndex((p) => p.id === id), 1);
  }

  /**
   * Remove all remote players from the scene
   */
  removeAll() {
    for (var p of this.players) {
      p.destroy();
    }
    this.players = [];
  }

  /**
   * Create multiple remote players directly from a lobby listing
   */
  addMany(playerListing: playerObject[], scene: GameMap) {
    for (var p of playerListing) {
      this.players.push(new RemotePlayer(p.x, p.y, p.id, p.username, scene));
    }
  }

  /**
   * Set a specific player to be the chaser
   */
  choose(id: number) {
    var player = this.players.find((p) => p.id === id);
    player.chosen();
  }

  /**
   * Update the velocity and position of a remote player
   */
  velocityUpdate(message: serverMessage) {
    var player = this.players.find((p) => p.id === message.id);
    if (player !== undefined) {
      player.velocityX = message.velocityX;
      player.velocityY = message.velocityY;
      player.x = message.x;
      player.y = message.y;
    }
  }

  /**
   * Make the player sprite invisible when they have been caught
   */
  catch(id: number) {
    var player = this.players.find((p) => p.id === id);
    player.visible = false;
  }

  /**
   * Update the positions of the nametags of the remote players
   */
  updateNametags() {
    for (var p of this.players) {
      p.updateNametag();
    }
  }

  /**
   * Get ID and distance of closest player to specific coords.
   * Returns it as [distance, ID]
   */
  getClosestPlayer(playerX: number, playerY: number) {
    let closestDist = Infinity;
    let closestId = -1;
    this.players.forEach(function(p) {
      if (Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y) < closestDist) {
        closestDist = Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y);
        closestId = p.id;
      }
    });
    return [closestDist, closestId];
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
  private playerManager: RemotePlayerManager;
  /** Whether the player has successfully joined a lobby yet. */
  private inLobby: boolean;
  /** Whether the local player is the game host or not. */
  public  amHost: boolean;
  /** Set to true when player has changed to/from being host */
  public  hostChangedFlag: boolean;
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
    this.playerManager = new RemotePlayerManager();
    this.inLobby = false;
    this.amHost = false;
    this.hostChangedFlag = false;
    this.gameProperties = {
      chaserVision: 2,
      runnerVision: 2,
      chaserSpeed: 200,
      runnerSpeed: 200,
      waitTime: 15,
      roundLength: 20,
      map: 0,
    }
  }

  /**
   * Connect to a server and join a lobby. Returns a promise.
   */
  join(address: string, lobbyCode: string, username: string): Promise<String> {
    this.lobbyCode = lobbyCode;
    this.username = username;
    this.error = undefined;
    return new Promise(function(resolve: Function, reject: Function) {
      this.communicator = new Communicator(address, this.onMessage.bind(this));
      var timeWaited = 0;

      function checkIfConnected() {
        if ((<MultiplayerHandler>this).inLobby) {
          resolve();
        } else {
          timeWaited += 250;
          if (this.communicator.error !== undefined) {
            reject("Unable to connect - server is probably down or doesn't exist.");
          } else if ((<MultiplayerHandler>this).error !== undefined) {
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
        this.updateHost();
        break

      case 5: // Velocity update from another player
        this.updateRemotePlayer(message);
        break;

      case 6: // New player joined lobby
        this.addNewPlayer(message);
        this.updateHost();
        break;

      case 7:
        this.gameProperties = message.properties;
        this.setHTMLPropertyInputs(message.properties);
        break;

      case 9: // Game starting
        this.gameProperties = message.properties;
        this.currentlyChosen = message.chosen;
        this.amChosen = (this.currentlyChosen === this.myid);
        this.amCaught = false;
        this.scene.fadeOutAndStartScene('scifi');
        break;

      case 11: // Left
        this.playerManager.remove(message.id);
        this.otherPlayers.splice(this.otherPlayers.findIndex((i) => i.id === message.id), 1);
        this.updateHost();
        break;

      case 14: // Caught
        if (message.id === this.myid) {
          this.amCaught = true;
        } else {
          this.playerManager.catch(message.id);
        }
        break;

      case 15: // Scores
        this.scene.fadeOutAndStartScene('score', message.scores);
        break;
    }
  }

  /**
   * Adds remote players to a scene.
   */
  setScene(scene: GameMap) {
    this.scene = scene;
    this.playerManager.removeAll();
    for(var player of this.otherPlayers) {
      //spawn at (100, 100) if round started or server specified coords if in holding area
      let x = (this.gameStarted) ? 100 : player.x;
      let y = (this.gameStarted) ? 100 : player.y;
      this.playerManager.add(x, y, player.id, player.username, this.scene);
    }
    if (this.currentlyChosen !== undefined && this.currentlyChosen !== this.myid) {
      this.playerManager.choose(this.currentlyChosen);
    }
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
      this.playerManager.velocityUpdate(message);
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
    this.playerManager.add(message.x, message.y,
      message.id, message.username, this.scene);
  }

  /**
   * Delete the remote player sprites and disconnect from the server.
   */
   leave() {
     this.playerManager.removeAll();
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
         type: 8, id: this.myid, properties: this.gameProperties
       });
     }
   }

   /**
    * Update the position of all the remote players' nametags.
    */
   updateNametags() {
     this.playerManager.updateNametags();
   }

  /**
  * Called when space pressed. If local player is the catcher and is
  * within required distance of other player, sends a 'catch' message
  * to the server with the other player's ID.
  */
  catch(playerX: number, playerY: number) {
    if (this.amChosen) {
      let [closestDist, closestId] = this.playerManager.getClosestPlayer(playerX, playerY);
      if (closestDist < 80) {
        this.communicator.send({
          type: 13, id: this.myid, caughtId: closestId
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

  /** Update amHost and hostChangedFlag, check if I'm now the host */
  private updateHost() {
    let hostId = this.otherPlayers.reduce((m, c) => m = Math.min(m, c.id), this.myid);
    let amNowHost = (hostId === this.myid);
    if (amNowHost !== this.amHost) {
      this.hostChangedFlag = true;
    }
    this.amHost = amNowHost;
  }

  /**
   * Update values in gameProperties element based on values of
   * HTML inputs.
   */
  public updateProperties() {
    var props  = {
      runnerVision: Number((<HTMLInputElement>document.getElementById("runnerVision")).value),
      chaserVision: Number((<HTMLInputElement>document.getElementById("chaserVision")).value),
      runnerSpeed: Number((<HTMLInputElement>document.getElementById("runnerSpeed")).value),
      chaserSpeed: Number((<HTMLInputElement>document.getElementById("chaserSpeed")).value),
      waitTime: Number((<HTMLInputElement>document.getElementById("waitTime")).value),
      roundLength: Number((<HTMLInputElement>document.getElementById("roundLength")).value),
      map: Number((<HTMLInputElement>document.getElementById("map")).value),
    }
    var propsStr = JSON.stringify(props, Object.keys(props).sort());
    var gamePropertiesStr = JSON.stringify(this.gameProperties, Object.keys(this.gameProperties).sort());
    if (propsStr !== gamePropertiesStr) {
      this.gameProperties = props;
      if (this.amHost) {
        this.sendDisplayPropertiesMessage();
      }
    }
  }

  /**
   * Send 'display properties' message (type 7) when properties set
   * have changed (if host)
   */
  private sendDisplayPropertiesMessage() {
    if (this.amHost) {
      this.communicator.send(
        {type: 7, id: this.myid, properties: this.gameProperties}
      );
    }
  }

  /**
   * Set values of HTML property inputs when 'display properties'
   * message received.
   */
  private setHTMLPropertyInputs (properties: gameProperties) {
    (<HTMLInputElement>document.getElementById("runnerVision")).value = String(properties.runnerVision);
    (<HTMLInputElement>document.getElementById("chaserVision")).value = String(properties.chaserVision);
    (<HTMLInputElement>document.getElementById("runnerSpeed")).value = String(properties.runnerSpeed);
    (<HTMLInputElement>document.getElementById("chaserSpeed")).value = String(properties.chaserSpeed);
    (<HTMLInputElement>document.getElementById("waitTime")).value = String(properties.waitTime);
    (<HTMLInputElement>document.getElementById("roundLength")).value = String(properties.roundLength);
    (<HTMLInputElement>document.getElementById("map")).value = String(properties.map);
  }
}
