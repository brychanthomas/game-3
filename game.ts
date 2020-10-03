import HelloWorldScene from './HelloWorldScene.js';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [HelloWorldScene],
}

export default new Phaser.Game(config)
