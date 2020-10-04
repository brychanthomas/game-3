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
var HoldingAreaScene = /** @class */ (function (_super) {
    __extends(HoldingAreaScene, _super);
    function HoldingAreaScene() {
        return _super.call(this, 'holdingArea', 'scifi-tileset') || this;
    }
    HoldingAreaScene.prototype.preload = function () {
        this.load.image('tileset', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('tilemap', 'assets/holdingArea.json');
        this.load.image('player', 'assets/circle.png');
    };
    HoldingAreaScene.prototype.update = function () {
        this.player.update();
    };
    return HoldingAreaScene;
}(GameMap));
export { HoldingAreaScene };
