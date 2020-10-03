import type SciFiScene from './SciFiScene.js';
import { RemotePlayer } from './player.js';

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
}

/**
 * Creates and manages multiplayer sprites and communication.
 */
export class MultiplayerHandler {

  private communicator: Communicator;
  private id: number;
  private scene: SciFiScene;
  private players: RemotePlayer[];

  constructor (scene: SciFiScene) {
    let address = prompt("Enter server address:", "localhost:5000");
    let username = prompt("Enter username:");
    this.communicator = new Communicator(address, this.onMessage.bind(this));
    this.scene = scene;
    this.players = [];
  }

  /**
   * When message received.
   */
  onMessage(raw: MessageEvent) {
    var message = JSON.parse(raw.data);
    if (message.idAssign !== undefined) {
      this.id = message.idAssign;
      let lobbyCode = prompt("Enter lobby code:");
      this.communicator.send({'id': this.id, 'join': lobbyCode});
    }
    else if (message.lobby !== undefined) {
      for (let player of message.lobby) {
        this.players.push(new RemotePlayer(player.x, player.y, player.id, this.scene));
      }
    }
    else if (message.newid !== undefined) {
      this.players.push(new RemotePlayer(0, 0, message.newid, this.scene));
    }
    else if (message.x !== undefined && message.y !== undefined && message.id !== this.id) {
      console.log(message.id);
      console.log(this.players);
      let player = this.players.find((p) => p.id === message.id);
      player.x = message.x;
      player.y = message.y;
    }
  }

  /**
   * Send the current pos of the player to the server.
   */
  sendPosition(x: number, y: number) {
    this.communicator.send({'id': this.id, 'x': x, 'y': y})
  }
}
