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
var Player = /** @class */ (function () {
    function Player(x, y, scene) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.4);
        this.scene = scene;
    }
    Object.defineProperty(Player.prototype, "x", {
        get: function () {
            return this.sprite.x;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "y", {
        get: function () {
            return this.sprite.y;
        },
        enumerable: false,
        configurable: true
    });
    return Player;
}());
var LocalPlayer = /** @class */ (function (_super) {
    __extends(LocalPlayer, _super);
    function LocalPlayer(x, y, obstacleLayer, scene) {
        var _this = _super.call(this, x, y, scene) || this;
        scene.cameras.main.startFollow(_this.sprite);
        _this.keys = scene.input.keyboard.addKeys('W,A,S,D');
        scene.physics.add.collider(_this.sprite, obstacleLayer);
        return _this;
    }
    LocalPlayer.prototype.update = function () {
        var keyDown = false;
        if (this.keys.W.isDown && this.y > 20) {
            this.sprite.body.setVelocityY(-200);
        }
        else if (this.keys.S.isDown && this.y < this.scene.height - 20) {
            this.sprite.body.setVelocityY(200);
        }
        else {
            this.sprite.body.setVelocityY(0);
        }
        if (this.keys.A.isDown && this.x > 20) {
            this.sprite.body.setVelocityX(-200);
        }
        else if (this.keys.D.isDown && this.x < this.scene.width - 20) {
            this.sprite.body.setVelocityX(200);
        }
        else {
            this.sprite.body.setVelocityX(0);
        }
    };
    return LocalPlayer;
}(Player));
export { LocalPlayer };
var RemotePlayer = /** @class */ (function () {
    function RemotePlayer() {
    }
    return RemotePlayer;
}());
export { RemotePlayer };
