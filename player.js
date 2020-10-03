var Player = /** @class */ (function () {
    function Player(x, y, scene) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.4);
        this.scene = scene;
        scene.cameras.main.startFollow(this.sprite);
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');
    }
    Player.prototype.update = function () {
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
export { Player };
