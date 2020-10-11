import { GameMap } from './scenes.js';

/**
 * Scene that players spawn into when they join.
 */
export class HoldingAreaScene extends GameMap {

  private playButton: Phaser.GameObjects.Image;

  constructor() {
    super('holdingArea', 'scifi-tileset');
  }

  preload() {
    this.load.image('tileset', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/holdingArea.json');
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
  }

  update() {
    this.player.update();
    if (this.player.hasVelocityChanged()) {
      this.game.multiplayerHandler.sendVelocityAndPosition(
        this.player.velocityX, this.player.velocityY, this.player.x, this.player.y
      );
    }
    this.updateFog();
  }

  /**
   * Called when play button is pressed.
   */
  private playButtonPressed() {
    this.game.multiplayerHandler.sendStartMessage();
  }
}
