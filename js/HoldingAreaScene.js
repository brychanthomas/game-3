import { GameMap } from './scenes.js';
/**
 * Scene that players spawn into when they join.
 */
export class HoldingAreaScene extends GameMap {
    constructor() {
        super('holdingArea');
    }
    preload() {
        this.tilesetKey = 'tileset';
        this.tilemapKey = 'holdingArea-tilemap';
        this.load.image('tileset', 'assets/scifitiles-sheet.png');
        this.load.tilemapTiledJSON('holdingArea-tilemap', 'assets/holdingArea.json');
        this.load.spritesheet('player', 'assets/red robot.png', { frameWidth: 250, frameHeight: 250 });
        this.load.image('vision', 'assets/mask.png');
        this.load.image('playButton', 'assets/playButton.png');
    }
    create() {
        this.game.multiplayerHandler.setScene(this);
        this.createTilemapPlayerAndFog();
        this.playButton = this.add.image(400, 500, 'playButton');
        this.playButton.setDepth(25); //bring to top
        this.playButton.setInteractive();
        this.playButton.on('pointerdown', this.playButtonPressed.bind(this));
        this.playButton.visible = this.game.multiplayerHandler.amHost;
        if (this.game.multiplayerHandler.amHost) { //show property sliders if host
            this.playButton.visible = true;
            this.setPropertyInputDisabled(false);
        }
        else {
            this.setPropertyInputDisabled(true);
        }
        this.setPropertyInputVisibility(true);
        this.createAnimations();
    }
    update() {
        this.player.update();
        this.game.multiplayerHandler.updateNametags();
        if (this.player.hasVelocityChanged()) {
            this.game.multiplayerHandler.sendVelocityAndPosition(this.player.velocityX, this.player.velocityY, this.player.x, this.player.y);
        }
        this.updateFog();
        if (this.game.multiplayerHandler.hostChangedFlag) {
            this.game.multiplayerHandler.hostChangedFlag = false;
            this.playButton.visible = this.game.multiplayerHandler.amHost;
        }
        this.game.multiplayerHandler.updateProperties();
        this.visionSize = this.game.multiplayerHandler.gameProperties.runnerVision;
        this.player.speed = this.game.multiplayerHandler.gameProperties.runnerSpeed;
    }
    /**
     * Called when play button is pressed - Hides property sliders and
     * labels and sends a start message to the server.
     */
    playButtonPressed() {
        this.setPropertyInputVisibility(false);
        this.playButton.visible = false;
        this.game.multiplayerHandler.sendStartMessage();
    }
    /**
     * Make the game property sliders enabled or disabled.
     */
    setPropertyInputDisabled(disabled) {
        for (var e of document.getElementsByClassName('properties')) {
            e.disabled = disabled;
        }
    }
}
