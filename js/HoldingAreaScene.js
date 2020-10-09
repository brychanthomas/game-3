import { GameMap } from './scenes.js';
export class HoldingAreaScene extends GameMap {
    constructor() {
        super('holdingArea', 'scifi-tileset');
    }
    preload() {
        this.load.image('tileset', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/holdingArea.json');
        this.load.image('player', 'assets/circle.png');
    }
    create() {
        this.game.multiplayerHandler.setScene(this);
        this.createTilemapAndPlayer();
    }
    update() {
        this.player.update();
        if (this.player.hasVelocityChanged()) {
            this.game.multiplayerHandler.sendVelocityAndPosition(this.player.velocityX, this.player.velocityY, this.player.x, this.player.y);
        }
    }
}
