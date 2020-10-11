import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';
import { MainMenuScene } from './MainMenuScene.js';
import { LoadingScene } from './LoadingScene.js';
import { MultiplayerHandler } from './multiplayer.js';
/**
Next tasks:

- Player becomes ghost when caught (invivible, doesn't send velocity
  to server but can still move)
*/
const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 800,
    height: 600,
    scene: [MainMenuScene, LoadingScene, HoldingAreaScene, SciFiScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
};
export class TheGame extends Phaser.Game {
    constructor(config) {
        super(config);
        this.multiplayerHandler = new MultiplayerHandler();
    }
}
export default new TheGame(config);
