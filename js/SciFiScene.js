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
import { Player } from './player.js';
var SciFiScene = /** @class */ (function (_super) {
    __extends(SciFiScene, _super);
    function SciFiScene() {
        return _super.call(this, 'scifi') || this;
    }
    SciFiScene.prototype.preload = function () {
        //https://opengameart.org/content/sci-fi-interior-tiles
        this.load.image('scifi_tiles', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');
        this.load.image('player', 'assets/circle.png');
    };
    SciFiScene.prototype.create = function () {
        var map = this.make.tilemap({ key: 'tilemap' });
        var tileset = map.addTilesetImage('scifi-tileset', 'scifi_tiles');
        map.createStaticLayer('Background', tileset).setScale(2);
        var obstacleLayer = map.createStaticLayer('Obstacles', tileset);
        obstacleLayer.setScale(2);
        map.setCollisionBetween(0, 84);
        var debugGraphics = this.add.graphics();
        // map.renderDebug(debugGraphics, {
        //  tileColor: null,
        //  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
        //  faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // });
        this.width = map.widthInPixels * 2;
        this.height = map.heightInPixels * 2;
        this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
        console.log(this.cameras.main);
        this.player = new Player(100, 100, obstacleLayer, this);
    };
    SciFiScene.prototype.update = function () {
        this.player.update();
    };
    return SciFiScene;
}(Phaser.Scene));
export default SciFiScene;
