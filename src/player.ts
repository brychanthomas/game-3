import type { GameMap } from './GameMap.js';

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

  constructor(x: number, y: number, scene: GameMap) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(0.4);
    console.log(this.sprite);
    this.scene = scene;
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

  constructor(x: number, y: number, obstacleLayer: Phaser.Tilemaps.StaticTilemapLayer, scene: GameMap) {
    super(x, y, scene);

    scene.cameras.main.startFollow(this.sprite);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D');

    scene.physics.add.collider(this.sprite, obstacleLayer);
  }

  /**
   * Update the velocity of the player based on the WASD keys.
   */
  update() {
    if (this.keys.W.isDown && this.y > 20) {
      this.sprite.body.setVelocityY(-200);
    } else if (this.keys.S.isDown && this.y < this.scene.height-20) {
      this.sprite.body.setVelocityY(200);
    } else {
      this.sprite.body.setVelocityY(0);
    }
    if (this.keys.A.isDown && this.x > 20) {
      this.sprite.body.setVelocityX(-200);
    } else if (this.keys.D.isDown && this.x < this.scene.width-20) {
      this.sprite.body.setVelocityX(200);
    } else {
      this.sprite.body.setVelocityX(0);
    }
  }

  get velocity() {
    return Math.max(Math.abs(this.sprite.body.velocity.x), Math.abs(this.sprite.body.velocity.y));
  }
}

// TODO: add multiplayer
/**
 * Class to represent a player that isn't being controlled
 * by the user, and is being controlled remotely as part of
 * multiplayer.
 */
export class RemotePlayer extends Player {

  public id: number;

  constructor(x: number, y: number, id: number, scene: GameMap) {
    super(x, y, scene);
    this.id = id;
  }

  set x(x: number) {
    this.sprite.x = x;
  }

  set y(y: number) {
    this.sprite.y = y;
  }

}
