import { GameMap } from './GameMap.js';
import type { MultiplayerHandler } from './multiplayer.js';

export class HoldingAreaScene extends GameMap {

  private multiplayerHandler: MultiplayerHandler;

  constructor() {
    super('holdingArea', 'scifi-tileset');
  }

  init(data: any) {
    this.multiplayerHandler = data.multiplayerHandler;
    this.multiplayerHandler.setScene(this);
  }

  preload() {
    this.load.image('tileset', 'assets/scifitiles-sheet.png');
    this.load.tilemapTiledJSON('tilemap', 'assets/holdingArea.json');
    this.load.image('player', 'assets/circle.png');
  }

  update() {
    this.player.update();
    if (this.player.velocity > 20) {
      this.multiplayerHandler.sendPosition(this.player.x, this.player.y);
    }
  }
}
