import { MultiplayerHandler } from './multiplayer.js';

export class LoadingScene extends Phaser.Scene {

  private multiplayerHandler: MultiplayerHandler;

  constructor() {
    super('loading');
  }

  preload() {}

  create() {
    this.add.text(100, 100, "Loading...");
    let address = (<HTMLInputElement>document.getElementById('serverAddress')).value;
    let lobbyCode = (<HTMLInputElement>document.getElementById('lobbyCode')).value;
    let username = (<HTMLInputElement>document.getElementById('username')).value;

    this.multiplayerHandler = new MultiplayerHandler();
    this.multiplayerHandler.join(address, lobbyCode, username)
      .then(function() {
        this.scene.start('holdingArea', {multiplayerHandler: this.multiplayerHandler});
      }.bind(this))
      .catch(function() {
        this.scene.start('mainMenu');
      }.bind(this));
  }

  update() {}
}
