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
var MainMenuScene = /** @class */ (function (_super) {
    __extends(MainMenuScene, _super);
    function MainMenuScene() {
        return _super.call(this, 'mainMenu') || this;
    }
    MainMenuScene.prototype.preload = function () { };
    MainMenuScene.prototype.create = function () {
        this.add.text(240, 60, "The Game", { fontSize: '64px', fontFamily: "Arial Black" });
        this.add.text(350, 300, "Lobby code:");
        this.add.text(350, 200, "Server address:");
        document.getElementById('lobbyCode').style.display = 'block';
        document.getElementById('serverAddress').style.display = 'block';
        document.getElementById('joinButton').style.display = 'block';
        document.getElementById('joinButton').addEventListener("click", this.joinPressed.bind(this));
    };
    MainMenuScene.prototype.update = function () { };
    MainMenuScene.prototype.joinPressed = function () {
        document.getElementById('lobbyCode').style.display = 'none';
        document.getElementById('serverAddress').style.display = 'none';
        document.getElementById('joinButton').style.display = 'none';
        this.scene.start('holdingArea');
    };
    return MainMenuScene;
}(Phaser.Scene));
export { MainMenuScene };
