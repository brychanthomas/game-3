/**
 * Abstract class that creates sprite and scene properties
 * for players.
*/
class Player {
    constructor(x, y, scene) {
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setScale(0.3);
        this.sprite.body.setSize(250 / 2.2, 250 / 2.2);
        this.sprite.depth = 19; //bring forwards but behind fog of war
        this.scene = scene;
        this.isChaser = false;
    }
    /**
     * Remove the sprite from the scene.
     */
    destroy() {
        this.sprite.destroy();
    }
    /**
     * Give the player sprite a red tint, indicating they are the chaser.
     */
    makeRed() {
        this.sprite.setTint(0xff0000);
    }
    /**
     * Set the texture of the player to "chaser" or "player"
     */
    set texture(t) {
        this.sprite.setTexture(t);
        let tex = this.scene.textures.get(t);
        let frame = tex.frames[tex.firstFrame];
        //set physics body size based on new texture
        let sideLength = (t === "chaser") ? frame.width : frame.width / 2.2;
        this.sprite.body.setSize(sideLength, sideLength);
    }
    /**
     * Change the player's texture and move them to (1000, 200). They are the chaser.
     */
    chosen() {
        //this.makeRed();
        this.isChaser = true;
        this.texture = 'chaser';
        this.sprite.x = 1000;
        this.sprite.y = 200;
    }
    get x() {
        return this.sprite.x;
    }
    get y() {
        return this.sprite.y;
    }
    /**
     * Apply the correct animation based on player's velocity.
     */
    updateAnimation() {
        let prefix = this.isChaser ? 'chaser' : 'player';
        let velX = this.sprite.body.velocity.x;
        let velY = this.sprite.body.velocity.y;
        if (velX !== 0 || velY !== 0) {
            let direction = '';
            direction += (velY === 0 ? '' : (velY > 0 ? 'S' : 'N'));
            direction += (velX === 0 ? '' : (velX > 0 ? 'E' : 'W'));
            this.sprite.anims.play(prefix + '-' + direction, true);
        }
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
        this.speed = 200;
        this.locked = false;
    }
    /**
     * Update the velocity of the player based on the WASD keys.
     */
    update() {
        if (!this.locked) {
            var blockedTop = this.sprite.body.top <= 0;
            var blockedBtm = this.sprite.body.bottom >= this.scene.height;
            var blockedLft = this.sprite.body.left <= 0;
            var blockedRgt = this.sprite.body.right >= this.scene.width;
            var velX = 0;
            var velY = 0;
            if (this.keys.W.isDown && !blockedTop) {
                velY = -this.speed;
            }
            else if (this.keys.S.isDown && !blockedBtm) {
                velY = this.speed;
            }
            if (this.keys.A.isDown && !blockedLft) {
                velX = -this.speed;
            }
            else if (this.keys.D.isDown && !blockedRgt) {
                velX = this.speed;
            }
            if (velX !== 0 && velY !== 0) {
                velX = Math.sqrt((Math.pow(this.speed, 2)) / 2) * velX / Math.abs(velX);
                velY = Math.sqrt((Math.pow(this.speed, 2)) / 2) * velY / Math.abs(velY);
            }
            this.sprite.body.setVelocityX(velX);
            this.sprite.body.setVelocityY(velY);
        }
        else {
            this.sprite.body.setVelocityX(0);
            this.sprite.body.setVelocityY(0);
        }
        this.updateAnimation();
        console.log(this.velocityY);
    }
    /**
     * Checks if X or Y velocity has changed since last time method
     * was called. Always false if player has been caught.
     */
    hasVelocityChanged() {
        if (this.amCaught) {
            return false;
        }
        if (this.velocityX !== this.previousVelocityX) {
            this.previousVelocityX = this.velocityX;
            return true;
        }
        else if (this.velocityY !== this.previousVelocityY) {
            this.previousVelocityY = this.velocityY;
            return true;
        }
        return false;
    }
    /**
     * Gets the x velocity of the player. If they are pushing against an obstacle
     * 0 is returned.
     */
    get velocityX() {
        if (this.sprite.body.velocity.x > 0 && this.sprite.body.blocked.right) {
            return 0;
        }
        if (this.sprite.body.velocity.x < 0 && this.sprite.body.blocked.left) {
            return 0;
        }
        return this.sprite.body.velocity.x;
    }
    /**
     * Gets the y velocity of the player. If they are pushing against an obstacle
     * 0 is returned.
     */
    get velocityY() {
        if (this.sprite.body.velocity.y > 0 && this.sprite.body.blocked.down) {
            return 0;
        }
        if (this.sprite.body.velocity.y < 0 && this.sprite.body.blocked.up) {
            return 0;
        }
        return this.sprite.body.velocity.y;
    }
    /**
     * When caught is set to true, the player becomes transparent,
     * collisions are disabled, speed is set to 200 and velocity
     * updates are not sent.
     */
    set caught(c) {
        this.amCaught = c;
        this.sprite.setAlpha(c ? 0.4 : 1);
        if (c === true) {
            this.speed = 200;
            this.sprite.body.checkCollision = {
                down: false, left: false, none: true, right: false, up: false
            };
        }
        else {
            this.sprite.body.checkCollision = {
                down: true, left: true, none: false, right: true, up: true
            };
        }
    }
    get caught() {
        return this.amCaught;
    }
    /** Check if W, A, S or D is down */
    get keyDown() {
        return (this.keys.W.isDown || this.keys.S.isDown || this.keys.A.isDown || this.keys.D.isDown);
    }
}
/**
 * Class to represent a player that isn't being controlled
 * by the user, and is being controlled remotely as part of
 * multiplayer.
 */
export class RemotePlayer extends Player {
    constructor(x, y, id, username, scene) {
        super(x, y, scene);
        this.id = id;
        this.nametag = scene.add.text(x, y - 30, username, { backgroundColor: '#000' });
        this.nametag.setOrigin(0.5);
        this.nametag.setAlpha(0.6);
        this.nametag.setDepth(19);
    }
    set x(x) {
        this.sprite.x = x;
    }
    set y(y) {
        this.sprite.y = y;
    }
    set velocityX(velX) {
        this.sprite.body.setVelocityX(velX);
        this.updateAnimation();
    }
    set velocityY(velY) {
        this.sprite.body.setVelocityY(velY);
        this.updateAnimation();
    }
    /**
     * Move the nametag to the position of the player
     */
    updateNametag() {
        this.nametag.x = this.sprite.x;
        this.nametag.y = this.sprite.body.top - 10;
    }
    get x() {
        return this.sprite.x;
    }
    get y() {
        return this.sprite.y;
    }
    /**
     * Set visibility of sprite and nametag.
     */
    set visible(v) {
        this.sprite.visible = v;
        this.nametag.visible = v;
    }
    destroy() {
        this.sprite.destroy();
        this.nametag.destroy();
    }
}
