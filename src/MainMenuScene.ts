import { AScene } from './scenes.js';

export class MainMenuScene extends AScene {

  constructor() {
    super('mainMenu');
  }

  preload() {
    this.load.json('mapData', 'assets/mapFilesData.json');
  }

  create() {
    this.game.mapFilesData = this.cache.json.get('mapData');
    this.add.text(240, 60, "The Game", {fontSize: '64px', fontFamily:"Arial Black"})
    document.getElementById("joinButton").onclick = this.joinPressed.bind(this);
    this.setMenuElementsVisibility(true);
  }

  update() {}

  joinPressed() {
    this.setMenuElementsVisibility(false);
    document.getElementById('joinButton').onclick  = undefined;
    this.scene.start('loading');
  }

  /** Set the visibility of the HTML elements shown on the main menu */
  private setMenuElementsVisibility(visible: boolean) {
    for (var e of document.getElementsByClassName('mainMenu')) {
      (<HTMLElement>e).style.display = visible ? 'block' : 'none';
    }
  }
}
