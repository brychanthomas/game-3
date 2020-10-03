import { Player } from './player.js';

export default class SciFiScene extends Phaser.Scene {

  private player;

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
    map.createStaticLayer('Background', tileset);
    map.createStaticLayer('Obstacles', tileset);
    map.setCollisionBetween(0, 84);
    var debugGraphics = this.add.graphics();
    //map.renderDebug(debugGraphics, {
    //  tileColor: null,
    //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
    //  faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    //});

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(1);

    this.player = new Player(100, 100, this);
  }

  update() {
    this.player.update();
  }
}
