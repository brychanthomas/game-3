import { LocalPlayer } from './player.js';
/**
 * Class inheriting from Phaser.Scene with TheGame as game
 * instead of Phaser.Game (allows for multiplayerHandler
 * property to be used).
 */
export class AScene extends Phaser.Scene {
}
/**
 * Abstract class to create a scene using a tilemap.
 */
export class GameMap extends AScene {
    constructor(sceneName, tiledTilesetName) {
        super(sceneName);
        this.tiledTilesetName = tiledTilesetName;
    }
    /**
     * Create the tilemap, the player and the fog of war.
     */
    createTilemapPlayerAndFog() {
        const map = this.make.tilemap({ key: 'tilemap' });
        const tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
        var floorLayer = map.createStaticLayer('Background', tileset).setScale(2.5);
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
        var rt = this.make.renderTexture({
            width: this.width,
            height: this.height
        }, true);
        rt.fill(0x000000, 1);
        rt.draw(floorLayer);
        rt.setTint(0x0a2948);
        rt.setDepth(20);
    }
    create() {
        this.createTilemapPlayerAndFog();
    }
}
