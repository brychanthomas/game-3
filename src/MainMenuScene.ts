export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('mainMenu');
  }

  preload() {}

  create() {
    this.add.text(240, 60, "The Game", {fontSize: '64px', fontFamily:"Arial Black"})
    this.add.text(350, 200, "Server address:");
    this.add.text(350, 300, "Lobby code:");
    this.add.text(350, 400, "Username:");
    document.getElementById('serverAddress').style.display = 'block';
    document.getElementById('lobbyCode').style.display = 'block';
    document.getElementById('username').style.display = 'block';
    document.getElementById('joinButton').style.display = 'block';
    document.getElementById('joinButton').addEventListener("click",this.joinPressed.bind(this));
  }

  update() {}

  joinPressed() {
    document.getElementById('serverAddress').style.display = 'none';
    document.getElementById('lobbyCode').style.display = 'none';
    document.getElementById('username').style.display = 'none';
    document.getElementById('joinButton').style.display = 'none';
    this.scene.start('holdingArea');
  }
}
