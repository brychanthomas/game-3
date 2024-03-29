import { LocalPlayer } from './player.js';
/**
 * Abstract class to create a scene using a tilemap.
 */
export class GameMap extends Phaser.Scene {
    constructor(sceneName, tiledTilesetName) {
        super(sceneName);
        this.tiledTilesetName = tiledTilesetName;
    }
    /**
     * Create the tilemap and the player.
     */
    create() {
        const map = this.make.tilemap({ key: 'tilemap' });
        const tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
        map.createStaticLayer('Background', tileset).setScale(2.5);
        var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
        obstacleLayer.setScale(2.5);
        map.setCollisionBetween(0, 84);
        // var debugGraphics = this.add.graphics();
        // map.renderDebug(debugGraphics, {
        //  tileColor: null,
        //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
        //  faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // });
        this.width = map.widthInPixels * 2.5;
        this.height = map.heightInPixels * 2.5;
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 2.5, map.heightInPixels * 2.5);
        this.player = new LocalPlayer(100, 100, obstacleLayer, this);
    }
}
