import { GameMap } from './GameMap.js';

export class HoldingAreaScene extends GameMap {
  constructor() {
    super('holdingArea', 'scifi-tileset');
  }

  preload() {
    this.load.image('tileset', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/holdingArea.json');
    this.load.image('player', 'assets/circle.png');
  }

  update() {
    this.player.update();
  }
}
