import { LocalPlayer } from './player.js';
import type { TheGame } from './game.js';

/**
 * Class inheriting from Phaser.Scene with TheGame as game
 * instead of Phaser.Game (allows for multiplayerHandler
 * property to be used).
 */
export class AScene extends Phaser.Scene {

  public game: TheGame;

}

/**
 * Abstract class to create a scene using a tilemap.
 */
export abstract class GameMap extends AScene {

  public height: number;
  public width: number;
  protected player: LocalPlayer;
  protected tiledTilesetName: string;
  protected vision: Phaser.GameObjects.Image;

  constructor(sceneName: string, tiledTilesetName: string) {
    super(sceneName);
    this.tiledTilesetName = tiledTilesetName;
  }

  /**
   * Load images and tilemaps.
   */
   abstract preload(): void;

  /**
   * Create the tilemap, the player and the fog of war.
   */
   createTilemapPlayerAndFog() {
     const map = this.make.tilemap({ key: 'tilemap' });
     const tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
     var floorLayer = map.createStaticLayer('Background', tileset).setScale(2.5);
     var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
     obstacleLayer.setScale(2.5);
     map.setCollisionBetween(0, 84);

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
}
