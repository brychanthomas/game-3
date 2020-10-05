import { GameMap } from './scenes.js';

export class SciFiScene extends GameMap {

  constructor() {
    super('scifi', 'scifi-tileset');
  }

  preload() {
    //https://opengameart.org/content/sci-fi-interior-tiles
    this.load.image('tileset', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');
    this.load.image('player', 'assets/circle.png');
  }

  update() {
    this.player.update();
  }
}
