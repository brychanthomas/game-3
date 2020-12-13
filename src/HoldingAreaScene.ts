import { GameMap } from './scenes.js';

/**
 * Scene that players spawn into when they join.
 */
export class HoldingAreaScene extends GameMap {

  private playButton: Phaser.GameObjects.Image;

  constructor() {
    super('holdingArea');
  }

  preload() {
    this.tilesetKey = 'tileset';
    this.tilemapKey = 'holdingArea-tilemap';
    this.load.image('tileset', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('holdingArea-tilemap', 'assets/holdingArea.json');
    this.load.image('player', 'assets/circle.png');
    this.load.image('vision', 'assets/mask.png');
    this.load.image('playButton', 'assets/playButton.png');
  }

  create() {
    this.game.multiplayerHandler.setScene(this);
    this.createTilemapPlayerAndFog();
    this.playButton = this.add.image(400, 500, 'playButton');
    this.playButton.setDepth(25); //bring to top
    this.playButton.setInteractive();
    this.playButton.on('pointerdown',this.playButtonPressed.bind(this));
    this.playButton.visible = this.game.multiplayerHandler.amHost;
    if (this.game.multiplayerHandler.amHost) { //show property sliders if host
      this.setHostViewVisibility(true);
    }
  }

  update() {
    this.player.update();
    this.game.multiplayerHandler.updateNametags();
    if (this.player.hasVelocityChanged()) {
      this.game.multiplayerHandler.sendVelocityAndPosition(
        this.player.velocityX, this.player.velocityY, this.player.x, this.player.y
      );
    }
    this.updateFog();
    if (this.game.multiplayerHandler.hostChangedFlag) {
      this.game.multiplayerHandler.hostChangedFlag = false;
      this.setHostViewVisibility(this.game.multiplayerHandler.amHost);
    }
    this.visionSize = Number((<HTMLInputElement>document.getElementById("runnerVision")).value);
    this.player.speed = Number((<HTMLInputElement>document.getElementById("runnerSpeed")).value);
  }

  /**
   * Called when play button is pressed - Hides property sliders and
   * labels and sends a start message to the server.
   */
  private playButtonPressed() {
    this.setHostViewVisibility(false);
    this.game.multiplayerHandler.sendStartMessage();
  }

  /**
   * Make the game property sliders and labels and the play button
   * visible or invisible.
   */
  private setHostViewVisibility(visible: boolean) {
    this.playButton.visible = visible;
    for (var e of document.getElementsByClassName('properties')) {
      (<HTMLElement>e).style.display = visible ? 'block' : 'none';
    }
  }
}
