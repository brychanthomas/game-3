import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';

const config: Phaser.Types.Core.GameConfig = {
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
}

export default new Phaser.Game(config)
