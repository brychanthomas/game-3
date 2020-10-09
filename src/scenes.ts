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

  constructor(sceneName: string, tiledTilesetName: string) {
    super(sceneName);
    this.tiledTilesetName = tiledTilesetName;
  }

  /**
   * Load images and tilemaps.
   */
   abstract preload(): void;

  /**
   * Create the tilemap and the player.
   */
   createTilemapAndPlayer() {
     const map = this.make.tilemap({ key: 'tilemap' });
     const tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
     map.createStaticLayer('Background', tileset).setScale(2.5);
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
   }

  create() {
    this.createTilemapAndPlayer();
  }

  abstract update(): void;
}
