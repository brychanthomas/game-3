import type SciFiScene from './SciFiScene';

interface wasdKeys {
  'W'?: Phaser.Input.Keyboard.Key,
  'A'?: Phaser.Input.Keyboard.Key,
  'S'?: Phaser.Input.Keyboard.Key,
  'D'?: Phaser.Input.Keyboard.Key
}

export class Player {

  private sprite: Phaser.GameObjects.Sprite;
  private scene: SciFiScene;
  private keys: wasdKeys;

  constructor(x: number, y: number, scene: SciFiScene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(0.4);
    this.scene = scene;

    scene.cameras.main.startFollow(this.sprite);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D');
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

  private get x() {
    return this.sprite.x;
  }

  private get y() {
    return this.sprite.y;
  }
}
