import { LocalPlayer } from './player.js';

export abstract class GameMap extends Phaser.Scene {

  public height: number;
  public width: number;
  protected player: LocalPlayer;
  protected tiledTilesetName: string;

  constructor(sceneName: string, tiledTilesetName: string) {
    super(sceneName);
    this.tiledTilesetName = tiledTilesetName;
  }

  abstract preload(): void;

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
    map.createStaticLayer('Background', tileset).setScale(2);
    var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
    obstacleLayer.setScale(2);
    map.setCollisionBetween(0, 84);

    var debugGraphics = this.add.graphics();
    // map.renderDebug(debugGraphics, {
    //  tileColor: null,
    //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
    //  faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    // });
    this.width = map.widthInPixels*2;
    this.height = map.heightInPixels*2;

    this.cameras.main.setBounds(0, 0, map.widthInPixels*2, map.heightInPixels*2);
    console.log(this.cameras.main);

    this.player = new LocalPlayer(100, 100, obstacleLayer, this);
  }
}
