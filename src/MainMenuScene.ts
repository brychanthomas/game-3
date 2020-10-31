import { AScene } from './scenes.js';

export class MainMenuScene extends AScene {

  constructor() {
    super('mainMenu');
  }

  preload() {
    this.load.json('mapData', 'assets/mapFilesData.json');
  }

  create() {
    this.game.mapFilesData = this.cache.json.get('mapData');
    console.log(this.game.mapFilesData);
    this.add.text(240, 60, "The Game", {fontSize: '64px', fontFamily:"Arial Black"})
    this.add.text(350, 200, "Server address:");
    this.add.text(350, 300, "Lobby code:");
    this.add.text(350, 400, "Username:");
    document.getElementById('serverAddress').style.display = 'block';
    document.getElementById('lobbyCode').style.display = 'block';
    document.getElementById('username').style.display = 'block';
    document.getElementById('joinButton').style.display = 'block';
    document.getElementById('joinButton').onclick = this.joinPressed.bind(this);
  }

  update() {}

  joinPressed() {
    document.getElementById('serverAddress').style.display = 'none';
    document.getElementById('lobbyCode').style.display = 'none';
    document.getElementById('username').style.display = 'none';
    document.getElementById('joinButton').style.display = 'none';
    document.getElementById('joinButton').onclick  = undefined;
    this.scene.start('loading');
  }
}
