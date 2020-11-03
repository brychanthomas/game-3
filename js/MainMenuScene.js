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
        this.add.text(240, 60, "The Game", { fontSize: '64px', fontFamily: "Arial Black" });
        this.setMenuElementsVisibility(true);
    }
    update() { }
    joinPressed() {
        this.setMenuElementsVisibility(false);
        document.getElementById('joinButton').onclick = undefined;
        this.scene.start('loading');
    }
    /** Set the visibility of the HTML elements shown on the main menu */
    setMenuElementsVisibility(visible) {
        for (var e of document.getElementsByClassName('mainMenu')) {
            e.style.display = visible ? 'block' : 'none';
        }
    }
}
