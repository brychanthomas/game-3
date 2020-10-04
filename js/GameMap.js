var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { LocalPlayer } from './player.js';
/**
 * Abstract class to create a scene using a tilemap.
 */
var GameMap = /** @class */ (function (_super) {
    __extends(GameMap, _super);
    function GameMap(sceneName, tiledTilesetName) {
        var _this = _super.call(this, sceneName) || this;
        _this.tiledTilesetName = tiledTilesetName;
        return _this;
    }
    /**
     * Create the tilemap and the player.
     */
    GameMap.prototype.create = function () {
        var map = this.make.tilemap({ key: 'tilemap' });
        var tileset = map.addTilesetImage(this.tiledTilesetName, 'tileset');
        map.createStaticLayer('Background', tileset).setScale(2.5);
        var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
        obstacleLayer.setScale(2.5);
        map.setCollisionBetween(0, 84);
        var debugGraphics = this.add.graphics();
        map.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });
        this.width = map.widthInPixels * 2.5;
        this.height = map.heightInPixels * 2.5;
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 2.5, map.heightInPixels * 2.5);
        this.player = new LocalPlayer(100, 100, obstacleLayer, this);
    };
    return GameMap;
}(Phaser.Scene));
export { GameMap };
