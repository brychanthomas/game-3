import type SciFiScene from './SciFiScene';

interface wasdKeys {
  'W'?: Phaser.Input.Keyboard.Key,
  'A'?: Phaser.Input.Keyboard.Key,
  'S'?: Phaser.Input.Keyboard.Key,
  'D'?: Phaser.Input.Keyboard.Key
}

abstract class Player {

  protected sprite: Phaser.GameObjects.Sprite;
  protected scene: SciFiScene;

  constructor(x: number, y: number, scene: SciFiScene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(0.4);
    this.scene = scene;
  }

  protected get x() {
    return this.sprite.x;
  }

  protected get y() {
    return this.sprite.y;
  }

}

export class LocalPlayer extends Player {

  private keys: wasdKeys;

  constructor(x: number, y: number, obstacleLayer: Phaser.Tilemaps.StaticTilemapLayer, scene: SciFiScene) {
    super(x, y, scene);

    scene.cameras.main.startFollow(this.sprite);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D');

    scene.physics.add.collider(this.sprite, obstacleLayer);
  }

  update() {
    var keyDown = false;
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
}

export class RemotePlayer {


  constructor() {

  }
}
