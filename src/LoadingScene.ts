import { AScene } from './scenes.js';

export class LoadingScene extends AScene {

  constructor() {
    super('loading');
  }

  preload() {}

  create() {
    this.add.text(100, 100, "Loading...");
    let address = (<HTMLInputElement>document.getElementById('serverAddress')).value;
    let lobbyCode = (<HTMLInputElement>document.getElementById('lobbyCode')).value;
    let username = (<HTMLInputElement>document.getElementById('username')).value;
    this.game.multiplayerHandler.leave();
    this.game.multiplayerHandler.join(address, lobbyCode, username)
      .then(function() {
        this.scene.start('holdingArea');
      }.bind(this))
      .catch(function(err: String) {
        this.scene.start('mainMenu');
        console.error(err);
        alert(err);
      }.bind(this));
  }

  update() {}
}
