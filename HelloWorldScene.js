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
var HelloWorldScene = /** @class */ (function (_super) {
    __extends(HelloWorldScene, _super);
    function HelloWorldScene() {
        return _super.call(this, 'hello-world') || this;
    }
    HelloWorldScene.prototype.preload = function () {
        this.load.image('base_tiles', 'assets/grass-tiles-2-small.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/level1.json');
    };
    HelloWorldScene.prototype.create = function () {
        var map = this.make.tilemap({ key: 'tilemap' });
        var tileset = map.addTilesetImage('grass-2-tiles-2-small', 'base_tiles');
        map.createStaticLayer('Background', tileset);
        this.input.keyboard.on('keydown-W', function (event) { this.scene.cameras.main.scrollY -= 4; });
        this.input.keyboard.on('keydown-A', function (event) { this.scene.cameras.main.scrollX -= 4; });
        this.input.keyboard.on('keydown-S', function (event) { this.scene.cameras.main.scrollY += 4; });
        this.input.keyboard.on('keydown-D', function (event) { this.scene.cameras.main.scrollX += 4; });
    };
    return HelloWorldScene;
}(Phaser.Scene));
export default HelloWorldScene;
