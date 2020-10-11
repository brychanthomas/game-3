/**
 * Abstract class that creates sprite and scene properties
 * for players.
*/
class Player {
    constructor(x, y, scene) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.4);
        this.scene = scene;
    }
    get x() {
        return this.sprite.x;
    }
    get y() {
        return this.sprite.y;
    }
    /**
     * Remove the sprite from the scene.
     */
    destroy() {
        this.sprite.destroy();
    }
}
/**
 * Class representing the player that is being controlled
 * by the user, as opposed to a remote multiplayer player.
 */
export class LocalPlayer extends Player {
    constructor(x, y, obstacleLayer, scene) {
        super(x, y, scene);
        scene.cameras.main.startFollow(this.sprite);
        this.keys = scene.input.keyboard.addKeys('W,A,S,D');
        scene.physics.add.collider(this.sprite, obstacleLayer);
    }
    /**
     * Update the velocity of the player based on the WASD keys.
     */
    update() {
        if (this.keys.W.isDown && this.y > 20 && !this.sprite.body.blocked.up) {
            this.sprite.body.setVelocityY(-200);
        }
        else if (this.keys.S.isDown && this.y < this.scene.height - 20 && !this.sprite.body.blocked.down) {
            this.sprite.body.setVelocityY(200);
        }
        else {
            this.sprite.body.setVelocityY(0);
        }
        if (this.keys.A.isDown && this.x > 20 && !this.sprite.body.blocked.left) {
            this.sprite.body.setVelocityX(-200);
        }
        else if (this.keys.D.isDown && this.x < this.scene.width - 20 && !this.sprite.body.blocked.right) {
            this.sprite.body.setVelocityX(200);
        }
        else {
            this.sprite.body.setVelocityX(0);
        }
    }
    /**
     * Checks if X or Y velocity has changed since last time method
     * was called.
     */
    hasVelocityChanged() {
        if (this.velocityX !== this.previousVelocityX) {
            this.previousVelocityX = this.sprite.body.velocity.x;
            return true;
        }
        else if (this.velocityY !== this.previousVelocityY) {
            this.previousVelocityY = this.sprite.body.velocity.y;
            return true;
        }
        return false;
    }
    get velocityX() {
        return this.sprite.body.velocity.x;
    }
    get velocityY() {
        return this.sprite.body.velocity.y;
    }
}
/**
 * Class to represent a player that isn't being controlled
 * by the user, and is being controlled remotely as part of
 * multiplayer.
 */
export class RemotePlayer extends Player {
    constructor(x, y, id, scene) {
        super(x, y, scene);
        this.id = id;
    }
    set x(x) {
        this.sprite.x = x;
    }
    set y(y) {
        this.sprite.y = y;
    }
    set velocityX(velX) {
        this.sprite.body.setVelocityX(velX);
    }
    set velocityY(velY) {
        this.sprite.body.setVelocityY(velY);
    }
}
