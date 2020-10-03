interface wasdKeys {
  'W'?: Phaser.Input.Keyboard.Key,
  'A'?: Phaser.Input.Keyboard.Key,
  'S'?: Phaser.Input.Keyboard.Key,
  'D'?: Phaser.Input.Keyboard.Key
}

export class Player {

  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private keys: wasdKeys;

  constructor(x: number, y: number, scene: Phaser.Scene) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setScale(0.2);
    this.scene = scene;

    scene.cameras.main.startFollow(this.sprite);

    this.keys = scene.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    var keyDown = false;
    if (this.keys.W.isDown) {
      this.sprite.body.setVelocityY(-100);
    } else if (this.keys.S.isDown) {
      this.sprite.body.setVelocityY(100);
    } else {
      this.sprite.body.setVelocityY(0);
    }
    if (this.keys.A.isDown) {
      this.sprite.body.setVelocityX(-100);
    } else if (this.keys.D.isDown) {
      this.sprite.body.setVelocityX(100);
    } else {
      this.sprite.body.setVelocityX(0);
    }
  }
}
