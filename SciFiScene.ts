export default class SciFiScene extends Phaser.Scene {

  constructor() {
    super('scifi');
  }

  preload() {
    //https://opengameart.org/content/sci-fi-interior-tiles
    this.load.image('scifi_tiles', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('scifi-tileset', 'scifi_tiles');
    map.createStaticLayer('Background', tileset);
    map.createStaticLayer('Obstacles', tileset);
    map.setCollisionBetween(0, 84);
    var debugGraphics = this.add.graphics();
    map.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    });

    this.input.keyboard.on('keydown-W', function (event: any) { this.scene.cameras.main.scrollY -= 4 });
    this.input.keyboard.on('keydown-A', function (event: any) { this.scene.cameras.main.scrollX -= 4 });
    this.input.keyboard.on('keydown-S', function (event: any) { this.scene.cameras.main.scrollY += 4 });
    this.input.keyboard.on('keydown-D', function (event: any) { this.scene.cameras.main.scrollX += 4 });
  }
}
