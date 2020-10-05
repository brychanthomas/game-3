import { SciFiScene } from './SciFiScene.js';
import { HoldingAreaScene } from './HoldingAreaScene.js';
import { MainMenuScene } from './MainMenuScene.js';
import { LoadingScene } from './LoadingScene.js';
import { MultiplayerHandler } from './multiplayer.js';


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    pixelArt: false,
    width: 800,
    height: 600,
    scene: [MainMenuScene, LoadingScene, HoldingAreaScene, SciFiScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
}

export class TheGame extends Phaser.Game {
  public multiplayerHandler: MultiplayerHandler;

  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
    this.multiplayerHandler = new MultiplayerHandler();
  }

}

export default new TheGame(config);
