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
import { GameMap } from './GameMap.js';
var SciFiScene = /** @class */ (function (_super) {
    __extends(SciFiScene, _super);
    function SciFiScene() {
        return _super.call(this, 'scifi', 'scifi-tileset') || this;
    }
    SciFiScene.prototype.preload = function () {
        //https://opengameart.org/content/sci-fi-interior-tiles
        this.load.image('tileset', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/sci-fi.json');
        this.load.image('player', 'assets/circle.png');
    };
    SciFiScene.prototype.update = function () {
        this.player.update();
    };
    return SciFiScene;
}(GameMap));
export default SciFiScene;
