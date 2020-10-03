import HelloWorldScene from './HelloWorldScene.js';
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [HelloWorldScene],
};
export default new Phaser.Game(config);
