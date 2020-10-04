import { LocalPlayer } from './player.js';
import { MultiplayerHandler } from './multiplayer.js';

export default class SciFiScene extends Phaser.Scene {

  private player: LocalPlayer;
  public width: number;
  public height: number;
  private multiplayerHandler: MultiplayerHandler;

  constructor() {
    super('scifi');
  }

  preload() {
    //https://opengameart.org/content/sci-fi-interior-tiles
    this.load.image('scifi_tiles', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');

    this.load.image('player', 'assets/circle.png');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('scifi-tileset', 'scifi_tiles');
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

  update() {
    this.player.update();
  }
}
