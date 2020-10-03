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
var SciFiScene = /** @class */ (function (_super) {
    __extends(SciFiScene, _super);
    function SciFiScene() {
        return _super.call(this, 'scifi') || this;
    }
    SciFiScene.prototype.preload = function () {
        //https://opengameart.org/content/sci-fi-interior-tiles
        this.load.image('scifi_tiles', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');
    };
    SciFiScene.prototype.create = function () {
        var map = this.make.tilemap({ key: 'tilemap' });
        var tileset = map.addTilesetImage('scifi-tileset', 'scifi_tiles');
        map.createStaticLayer('Background', tileset);
        map.createStaticLayer('Obstacles', tileset);
        map.setCollisionBetween(0, 84);
        var debugGraphics = this.add.graphics();
        map.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });
        this.input.keyboard.on('keydown-W', function (event) { this.scene.cameras.main.scrollY -= 4; });
        this.input.keyboard.on('keydown-A', function (event) { this.scene.cameras.main.scrollX -= 4; });
        this.input.keyboard.on('keydown-S', function (event) { this.scene.cameras.main.scrollY += 4; });
        this.input.keyboard.on('keydown-D', function (event) { this.scene.cameras.main.scrollX += 4; });
    };
    return SciFiScene;
}(Phaser.Scene));
export default SciFiScene;
