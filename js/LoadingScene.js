import { AScene } from './scenes.js';
export class LoadingScene extends AScene {
    constructor() {
        super('loading');
    }
    preload() { }
    create() {
        this.add.text(100, 100, "Loading...");
        let address = document.getElementById('serverAddress').value;
        let lobbyCode = document.getElementById('lobbyCode').value;
        let username = document.getElementById('username').value;
        this.game.multiplayerHandler.join(address, lobbyCode, username)
            .then(function () {
            this.scene.start('holdingArea', { multiplayerHandler: this.multiplayerHandler });
        }.bind(this))
            .catch(function () {
            this.scene.start('mainMenu');
        }.bind(this));
    }
    update() { }
}
