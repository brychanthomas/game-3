import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [HoldingAreaScene, SciFiScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
};
export default new Phaser.Game(config);
