import { GameMap } from './scenes.js';

export class SciFiScene extends GameMap {

  /** Text showing seconds left in round. */
  private countdownText: Phaser.GameObjects.Text;
  /** Whether the countdown is showing the wait time or the round time */
  private countdownType: "wait"|"round";
  /** Shown if player tries to move while locked */
  private cannotMoveText: Phaser.GameObjects.Text;

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
    this.load.spritesheet('chaser', 'assets/robot.png', {frameWidth:250, frameHeight:250});
    this.load.image('vision', 'assets/mask.png');
  }

  create() {
    this.countdownType = "wait";
    this.game.multiplayerHandler.setScene(this);
    this.createTilemapPlayerAndFog();
    if(this.game.multiplayerHandler.amChosen) {
      this.player.chosen();
      this.playerIsChosen();
    }
    let p = this.game.multiplayerHandler.gameProperties;
    this.player.speed = (this.game.multiplayerHandler.amChosen) ? p.chaserSpeed : p.runnerSpeed;
    this.visionSize = (this.game.multiplayerHandler.amChosen) ? p.chaserVision : p.runnerVision;
    this.cameras.main.fadeIn(500, 0, 0, 0);

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

    this.cannotMoveText = this.add.text(20, 20, "You cannot move yet!");
    this.cannotMoveText.visible = false;
    this.cannotMoveText.depth = 21;

    this.createAnimations();
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

    if (this.player.locked && this.player.keyDown) {
      this.cannotMoveText.x = this.cameras.main.scrollX + 20;
      this.cannotMoveText.y = this.cameras.main.scrollY + 20;
      this.cannotMoveText.visible = true;
    } else {
      this.cannotMoveText.visible = false;
    }
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

  /**
 * Create the spritesheet animations of the chaser
 */
  private createAnimations() {
    let frameRate = 6;
    this.anims.create({
      key: 'chaser-right',
      frames: this.anims.generateFrameNumbers('chaser', {start: 0, end: 3}),
      frameRate: frameRate,
      repeat: -1
    });
    this.anims.create({
      key: 'chaser-left',
      frames: this.anims.generateFrameNumbers('chaser', {start: 4, end: 7}),
      frameRate: frameRate,
      repeat: -1
    });
    this.anims.create({
      key: 'chaser-down',
      frames: this.anims.generateFrameNumbers('chaser', {start: 8, end: 11}),
      frameRate: frameRate,
      repeat: -1
    });
    this.anims.create({
      key: 'chaser-up',
      frames: this.anims.generateFrameNumbers('chaser', {start: 12, end: 15}),
      frameRate: frameRate,
      repeat: -1
    });
  }
}
