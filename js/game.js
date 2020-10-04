import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';
import { MainMenuScene } from './MainMenuScene.js';
var config = {
    type: Phaser.AUTO,
    pixelArt: false,
    width: 800,
    height: 600,
    scene: [MainMenuScene, HoldingAreaScene, SciFiScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
};
export default new Phaser.Game(config);
