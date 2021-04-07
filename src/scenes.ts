import { LocalPlayer } from './player.js';
import type { TheGame } from './game.js';

/**
 * Class inheriting from Phaser.Scene with TheGame as game
 * instead of Phaser.Game (allows for multiplayerHandler
 * property to be used).
 */
export class AScene extends Phaser.Scene {

  public game: TheGame;

  /**
   * Fade out the camera and then start given scene.
   */
  public fadeOutAndStartScene(scene: string, data?: any) {
    this.setPropertyInputVisibility(false);
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(scene, data);
    });
  }

  /**
   * Make the game property sliders and labels visible or invisible.
   */
  protected setPropertyInputVisibility(visible: boolean) {
    for (var e of document.getElementsByClassName('properties')) {
      (<HTMLElement>e).style.display = visible ? 'block' : 'none';
    }
  }

}

/**
 * Abstract class to create a scene using a tilemap.
 */
export abstract class GameMap extends AScene {

  public height: number;
  public width: number;
  protected player: LocalPlayer;
  protected tilesetKey: string;
  protected tilemapKey: string;
  protected vision: Phaser.GameObjects.Image;

  constructor(sceneName: string) {
    super(sceneName);
  }

  /**
   * Load images and tilemaps.
   */
   abstract preload(): void;

  /**
   * Create the tilemap, the player and the fog of war.
   */
   createTilemapPlayerAndFog() {
     const map = this.make.tilemap({ key: this.tilemapKey });
     const tileset = map.addTilesetImage('tileset', this.tilesetKey);
     var floorLayer = map.createStaticLayer('Background', tileset).setScale(2.5);
     var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
     obstacleLayer.setScale(2.5);
     map.setCollisionBetween(0, 200);

      // var debugGraphics = this.add.graphics();
      // map.renderDebug(debugGraphics, {
      //  tileColor: null,
      //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
      //  faceColor: new Phaser.Display.Color(40, 39, 37, 255)
      // });

     this.width = map.widthInPixels*2.5;
     this.height = map.heightInPixels*2.5;

     this.cameras.main.setBounds(0, 0, map.widthInPixels*2.5, map.heightInPixels*2.5);

     this.player = new LocalPlayer(100, 100, obstacleLayer, this);

     var rt = this.make.renderTexture({
       width: this.width,
       height: this.height
     }, true);
     rt.fill(0x000000, 1); //black fill
     rt.draw(floorLayer); //show floor layer
     rt.setTint(0x0a2948); //dark blue tint
     rt.setDepth(20); //bring to front

     this.vision = this.make.image({ //create visible area
       x: this.player.x,
       y: this.player.y,
       key: 'vision',
       add: false
     });
     this.vision.scale = 2.5; //set size of visible area
     rt.mask = new Phaser.Display.Masks.BitmapMask(this, this.vision);
     rt.mask.invertAlpha = true;
   }

   /**
    * Executed when scene starts to create game objects.
    */
  create() {
    this.createTilemapPlayerAndFog();
  }

  /**
   * Updates the fog of war based on the player's position.
   */
  updateFog() {
    this.vision.x = this.player.x;
    this.vision.y = this.player.y;
  }

  /**
   * Sets the size of the area the player can see in fog of war.
   */
  set visionSize(s: number) {
    this.vision.scale = s;
  }

  abstract update(): void;

  /**
   * Locks the position of the player and adds a timeout to
   * unlock them after wait time seconds
   * */
  playerIsChosen() {
    this.player.locked = true;
    setTimeout(function(){
      this.player.locked = false;
    }.bind(this), this.game.multiplayerHandler.gameProperties.waitTime*1000);
  }

  /**
  * Create the spritesheet animations of the players and chaser
  */
  protected createAnimations() {
    let frameRate = 8;
    for (let prefix of ['chaser', 'player']) {
      this.anims.create({
        key: prefix+'-E',
        frames: this.anims.generateFrameNumbers(prefix, {start: 0, end: 7}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-W',
        frames: this.anims.generateFrameNumbers(prefix, {start: 8, end: 15}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-S',
        frames: this.anims.generateFrameNumbers(prefix, {start: 16, end: 23}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-N',
        frames: this.anims.generateFrameNumbers(prefix, {start: 24, end: 31}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-SE',
        frames: this.anims.generateFrameNumbers(prefix, {start: 32, end: 39}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-SW',
        frames: this.anims.generateFrameNumbers(prefix, {start: 40, end: 47}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-NW',
        frames: this.anims.generateFrameNumbers(prefix, {start: 48, end: 55}),
        frameRate: frameRate,
        repeat: -1
      });
      this.anims.create({
        key: prefix+'-NE',
        frames: this.anims.generateFrameNumbers(prefix, {start: 56, end: 63}),
        frameRate: frameRate,
        repeat: -1
      });
    }
  }
}
