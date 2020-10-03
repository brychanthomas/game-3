var Player = /** @class */ (function () {
    function Player(x, y, scene) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.2);
        this.scene = scene;
        scene.cameras.main.startFollow(this.sprite);
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');
    }
    Player.prototype.update = function () {
        var keyDown = false;
        if (this.keys.W.isDown) {
            this.sprite.body.setVelocityY(-100);
        }
        else if (this.keys.S.isDown) {
            this.sprite.body.setVelocityY(100);
        }
        else {
            this.sprite.body.setVelocityY(0);
        }
        if (this.keys.A.isDown) {
            this.sprite.body.setVelocityX(-100);
        }
        else if (this.keys.D.isDown) {
            this.sprite.body.setVelocityX(100);
        }
        else {
            this.sprite.body.setVelocityX(0);
        }
    };
    return Player;
}());
export { Player };
