import { GameMap } from './scenes.js';

interface wasdKeys {
  'W'?: Phaser.Input.Keyboard.Key,
  'A'?: Phaser.Input.Keyboard.Key,
  'S'?: Phaser.Input.Keyboard.Key,
  'D'?: Phaser.Input.Keyboard.Key
}

/**
 * Abstract class that creates sprite and scene properties
 * for players.
*/
abstract class Player {

  protected sprite: Phaser.GameObjects.Sprite;
  protected scene: GameMap;
  /** Whether or not player is chaser */
  protected isChaser: boolean;

  constructor(x: number, y: number, scene: GameMap) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(0.4);
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
  private makeRed() {
    this.sprite.setTint(0xff0000);
  }

  /**
   * Set the texture of the player to "chaser" or "player"
   */
  private set texture(t: "chaser"|"player") {
    this.sprite.setTexture(t);
    let tex = this.scene.textures.get(t);
    let frame = tex.frames[tex.firstFrame];
    //set physics body size based on new texture
    this.sprite.body.setSize(frame.width, frame.height);
    this.sprite.setScale((t==="chaser") ? 0.3 : 0.4);
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

  public get x() {
    return this.sprite.x;
  }

  public get y() {
    return this.sprite.y;
  }

}

/**
 * Class representing the player that is being controlled
 * by the user, as opposed to a remote multiplayer player.
 */
export class LocalPlayer extends Player {

  private keys: wasdKeys;
  private previousVelocityX: number;
  private previousVelocityY: number;
  private amCaught: boolean;
  public  speed: number;
  /** If the player is locked they can't move */
  public  locked: boolean;

  constructor(x: number, y: number, obstacleLayer: Phaser.Tilemaps.StaticTilemapLayer, scene: GameMap) {
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
      if (this.keys.W.isDown && this.y > 20 && !this.sprite.body.blocked.up) {
        this.sprite.body.setVelocityY(-this.speed);
        if (this.isChaser) {this.sprite.anims.play('chaser-up', true);}
      } else if (this.keys.S.isDown && this.y < this.scene.height-20 && !this.sprite.body.blocked.down) {
        this.sprite.body.setVelocityY(this.speed);
        if (this.isChaser) {this.sprite.anims.play('chaser-down', true);}
      } else {
        this.sprite.body.setVelocityY(0);
      }
      if (this.keys.A.isDown && this.x > 20 && !this.sprite.body.blocked.left) {
        this.sprite.body.setVelocityX(-this.speed);
        if (this.isChaser) {this.sprite.anims.play('chaser-left', true);}
      } else if (this.keys.D.isDown && this.x < this.scene.width-20 && !this.sprite.body.blocked.right) {
        this.sprite.body.setVelocityX(this.speed);
        if (this.isChaser) {this.sprite.anims.play('chaser-right', true);}
      } else {
        this.sprite.body.setVelocityX(0);
      }
    } else {
      this.sprite.body.setVelocityX(0);
      this.sprite.body.setVelocityY(0);
    }
  }

  /**
   * Checks if X or Y velocity has changed since last time method
   * was called. Always false if player has been caught.
   */
  hasVelocityChanged() {
    if (this.amCaught) { return false; }
    if (this.velocityX !== this.previousVelocityX) {
      this.previousVelocityX = this.sprite.body.velocity.x;
      return true;
    } else if (this.velocityY !== this.previousVelocityY) {
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

  /**
   * When caught is set to true, the player becomes transparent,
   * collisions are disabled, speed is set to 200 and velocity
   * updates are not sent.
   */
  set caught(c: boolean) {
    this.amCaught = c;
    this.sprite.setAlpha(c ? 0.4 : 1);
    if (c === true) {
      this.speed = 200;
      this.sprite.body.checkCollision = {
        down: false, left: false, none: true, right: false, up: false
      }
    } else {
      this.sprite.body.checkCollision = {
        down: true, left: true, none: false, right: true, up: true
      }
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

  public  id: number;
  private nametag: Phaser.GameObjects.Text;

  constructor(x: number, y: number, id: number, username: string, scene: GameMap) {
    super(x, y, scene);
    this.id = id;
    this.nametag = scene.add.text(x, y-30, username, {backgroundColor: '#000'});
    this.nametag.setOrigin(0.5);
    this.nametag.setAlpha(0.6);
    this.nametag.setDepth(19);
  }

  set x(x: number) {
    this.sprite.x = x;
  }

  set y(y: number) {
    this.sprite.y = y;
  }

  set velocityX(velX: number) {
    this.sprite.body.setVelocityX(velX);
  }

  set velocityY(velY: number) {
    this.sprite.body.setVelocityY(velY);
  }

  /**
   * Move the nametag to the position of the player
   */
  updateNametag() {
    this.nametag.x = this.sprite.x;
    this.nametag.y = this.sprite.y-30;
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
  set visible(v: boolean) {
    this.sprite.visible = v;
    this.nametag.visible = v;
  }

  public destroy() {
    this.sprite.destroy();
    this.nametag.destroy();
  }

}
