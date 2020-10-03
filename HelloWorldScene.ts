export default class HelloWorldScene extends Phaser.Scene {

  constructor() {
    super('hello-world');
  }

  preload() {
    this.load.image('base_tiles', 'assets/grass-tiles-2-small.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/level1.json');
  }

  create() {
    const map = this.make.tilemap({ key: 'tilemap' });
    const tileset = map.addTilesetImage('grass-2-tiles-2-small', 'base_tiles');
    map.createStaticLayer('Background', tileset);
    
    this.input.keyboard.on('keydown-W', function (event: any) { this.scene.cameras.main.scrollY -= 4 });
    this.input.keyboard.on('keydown-A', function (event: any) { this.scene.cameras.main.scrollX -= 4 });
    this.input.keyboard.on('keydown-S', function (event: any) { this.scene.cameras.main.scrollY += 4 });
    this.input.keyboard.on('keydown-D', function (event: any) { this.scene.cameras.main.scrollX += 4 });
  }
}
