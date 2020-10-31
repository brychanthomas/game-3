import { GameMap } from './scenes.js';

export class SciFiScene extends GameMap {

  /** Text showing seconds left in round. */
  private countdownText: Phaser.GameObjects.Text;
  /** Whether the countdown is showing the wait time or the round time */
  private countdownType: "wait"|"round";

  constructor() {
    super('scifi');
  }

  preload() {
    let map = this.game.multiplayerHandler.gameProperties.map;
    this.tilesetKey = map + '-tileset';
    this.tilemapKey = map + '-tilemap';
    this.load.image(map+'-tileset', this.game.mapFilesData[map].tileset);
    this.load.tilemapTiledJSON(map+'-tilemap', this.game.mapFilesData[map].tilemap);
    this.load.image('player', 'assets/circle.png');
    this.load.image('vision', 'assets/mask.png');
  }

  create() {
    this.countdownType = "wait";
    this.cameras.main.fadeOut(0, 0, 0, 0);
    this.game.multiplayerHandler.setScene(this);
    this.createTilemapPlayerAndFog();
    setTimeout(function() {
      if(this.game.multiplayerHandler.amChosen) {
        this.player.chosen();
        this.playerIsChosen();
      }
      let p = this.game.multiplayerHandler.gameProperties;
      this.player.speed = (this.game.multiplayerHandler.amChosen) ? p.chaserSpeed : p.runnerSpeed;
      this.visionSize = (this.game.multiplayerHandler.amChosen) ? p.chaserVision : p.runnerVision;
      this.cameras.main.fadeIn(500, 0, 0, 0);
    }.bind(this), 100);

    this.input.keyboard.on('keydown-SPACE', function () {
      this.game.multiplayerHandler.catch(this.player.x, this.player.y);
    }.bind(this));

    //call this.updateTimer() every second to change the countdown in the corner
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      repeat: this.game.multiplayerHandler.gameProperties.roundLength+this.game.multiplayerHandler.gameProperties.waitTime
    });
    this.countdownText = this.add.text(0, 0,
      String(this.game.multiplayerHandler.gameProperties.waitTime), {fontSize: '30px', color: 'green'});
    this.countdownText.depth = 21; //bring to front
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

    this.player.caught = this.game.multiplayerHandler.amCaught;
    if (this.player.caught) {
      this.visionSize = 5;
    }
    this.countdownText.x = this.cameras.main.scrollX + 750;
    this.countdownText.y = this.cameras.main.scrollY + 550;
  }

  /**
   * Called every second by Phaser clock to update countdown text.
   */
  private updateTimer() {
    if (Number(this.countdownText.text) - 1 < 0 && this.countdownType === "wait") {
      this.countdownText.text = String(this.game.multiplayerHandler.gameProperties.roundLength);
      this.countdownText.setFill("red");
      return;
    }
    this.countdownText.text = String(Number(this.countdownText.text) - 1);
  }
}
