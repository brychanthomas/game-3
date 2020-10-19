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
        setTimeout(function () {
            if (this.game.multiplayerHandler.amChosen) {
                this.player.chosen();
            }
            let p = this.game.multiplayerHandler.gameProperties;
            this.player.speed = (this.game.multiplayerHandler.amChosen) ? p.chaserSpeed : p.runnerSpeed;
            this.visionSize = (this.game.multiplayerHandler.amChosen) ? p.chaserVision : p.runnerVision;
        }.bind(this), 100);
        this.input.keyboard.on('keydown-SPACE', function () {
            this.game.multiplayerHandler.catch(this.player.x, this.player.y);
        }.bind(this));
    }
    update() {
        this.player.update();
        this.game.multiplayerHandler.updateNametags();
        if (this.player.hasVelocityChanged()) {
            this.game.multiplayerHandler.sendVelocityAndPosition(this.player.velocityX, this.player.velocityY, this.player.x, this.player.y);
        }
        this.updateFog();
        this.player.caught = this.game.multiplayerHandler.amCaught;
    }
}
