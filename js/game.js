import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';
import { MainMenuScene } from './MainMenuScene.js';
import { LoadingScene } from './LoadingScene.js';
import { MultiplayerHandler } from './multiplayer.js';
import { ScoreScene } from './ScoreScene.js';
/**
Next tasks:

- Better font
- Countdown
- Transitions
- Loading icon
- Fix weird bug when connecting on second attempt?
*/
const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 800,
    height: 600,
    scene: [MainMenuScene, LoadingScene, HoldingAreaScene, SciFiScene, ScoreScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
};
/**
 * Phaser.Game but with an extra multiplayerHandler property
 */
export class TheGame extends Phaser.Game {
    constructor(config) {
        super(config);
        this.multiplayerHandler = new MultiplayerHandler();
    }
}
export default new TheGame(config);
