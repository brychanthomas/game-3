import { GameMap } from './scenes.js';
export class SciFiScene extends GameMap {
    constructor() {
        super('scifi', 'scifi-tileset', 'tileset', 'scifi-tilemap');
    }
    preload() {
        //https://opengameart.org/content/sci-fi-interior-tiles
        this.load.image('tileset', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('scifi-tilemap', 'assets/sci-fi.json');
        this.load.image('player', 'assets/circle.png');
        this.load.image('vision', 'assets/mask.png');
    }
    create() {
        this.game.multiplayerHandler.setScene(this);
        this.createTilemapPlayerAndFog();
    }
    update() {
        this.player.update();
        if (this.player.hasVelocityChanged()) {
            this.game.multiplayerHandler.sendVelocityAndPosition(this.player.velocityX, this.player.velocityY, this.player.x, this.player.y);
        }
        this.updateFog();
    }
}
