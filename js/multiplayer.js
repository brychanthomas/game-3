import { RemotePlayer } from './player.js';
/**
 * Opens a WebSocket connection for sending and receiving
 * data.
 */
class Communicator {
    constructor(address, messageCallback) {
        this.serverAddress = address;
        this.websocket = new WebSocket('ws://' + this.serverAddress);
        this.websocket.onmessage = messageCallback;
        this.websocket.onerror = function (err) { this.error = err; }.bind(this);
    }
    send(data) {
        this.websocket.send(JSON.stringify(data));
    }
    close() {
        this.websocket.close(1000, "Leaving lobby");
    }
}
/**
 * Creates RemotePlayers and updates their positions
 */
class RemotePlayerManager {
    constructor() {
        this.players = [];
    }
    /**
     * Add a new player to the scene.
     */
    add(x, y, id, username, scene) {
        this.players.push(new RemotePlayer(x, y, id, username, scene));
    }
    /**
     * Remove player with specific ID from scene
     */
    remove(id) {
        var player = this.players.find((p) => p.id === id);
        player.destroy();
        this.players.splice(this.players.findIndex((p) => p.id === id), 1);
    }
    /**
     * Remove all remote players from the scene
     */
    removeAll() {
        for (var p of this.players) {
            p.destroy();
        }
        this.players = [];
    }
    /**
     * Create multiple remote players directly from a lobby listing
     */
    addMany(playerListing, scene) {
        for (var p of playerListing) {
            this.players.push(new RemotePlayer(p.x, p.y, p.id, p.username, scene));
        }
    }
    /**
     * Set a specific player to be the chaser
     */
    choose(id) {
        var player = this.players.find((p) => p.id === id);
        player.chosen();
    }
    /**
     * Update the velocity and position of a remote player
     */
    velocityUpdate(message) {
        var player = this.players.find((p) => p.id === message.id);
        if (player !== undefined) {
            player.velocityX = message.velocityX;
            player.velocityY = message.velocityY;
            player.x = message.x;
            player.y = message.y;
        }
    }
    /**
     * Make the player sprite invisible when they have been caught
     */
    catch(id) {
        var player = this.players.find((p) => p.id === id);
        player.visible = false;
    }
    /**
     * Update the positions of the nametags of the remote players
     */
    updateNametags() {
        for (var p of this.players) {
            p.updateNametag();
        }
    }
    /**
     * Get ID and distance of closest player to specific coords.
     * Returns it as [distance, ID]
     */
    getClosestPlayer(playerX, playerY) {
        let closestDist = Infinity;
        let closestId = -1;
        this.players.forEach(function (p) {
            if (Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y) < closestDist) {
                closestDist = Phaser.Math.Distance.Between(playerX, playerY, p.x, p.y);
                closestId = p.id;
            }
        });
        return [closestDist, closestId];
    }
}
/**
 * Creates and manages multiplayer sprites and communication.
 */
export class MultiplayerHandler {
    constructor() {
        this.playerManager = new RemotePlayerManager();
        this.inLobby = false;
        this.amHost = false;
        this.hostChangedFlag = false;
    }
    /**
     * Connect to a server and join a lobby. Returns a promise.
     */
    join(address, lobbyCode, username) {
        this.lobbyCode = lobbyCode;
        this.username = username;
        this.error = undefined;
        return new Promise(function (resolve, reject) {
            this.communicator = new Communicator(address, this.onMessage.bind(this));
            var timeWaited = 0;
            function checkIfConnected() {
                if (this.inLobby) {
                    resolve();
                }
                else {
                    timeWaited += 250;
                    if (this.communicator.error !== undefined) {
                        reject("Unable to connect - server is probably down or doesn't exist.");
                    }
                    else if (this.error !== undefined) {
                        reject("Server error: " + this.error);
                    }
                    if (timeWaited >= 5000) {
                        reject("Timeout error - did not join lobby within 5 seconds.");
                    }
                    else {
                        setTimeout(checkIfConnected.bind(this), 250);
                    }
                }
            }
            setTimeout(checkIfConnected.bind(this), 250);
        }.bind(this));
    }
    /**
     * Process message from server.
     */
    onMessage(raw) {
        var message = JSON.parse(raw.data);
        switch (message.type) {
            case 0:
                this.error = message.error;
                break;
            case 1: // ID assign
                this.myid = message.idAssign;
                this.communicator.send({
                    type: 2, id: this.myid, lobbyCode: this.lobbyCode, username: this.username
                });
                break;
            case 3: // Player listing
                this.otherPlayers = message.lobby;
                this.inLobby = true;
                this.updateHost();
                break;
            case 5: // Velocity update from another player
                this.updateRemotePlayer(message);
                break;
            case 6: // New player joined lobby
                this.addNewPlayer(message);
                this.updateHost();
                break;
            case 9: // Game starting
                this.gameProperties = message.properties;
                this.currentlyChosen = message.chosen;
                this.amChosen = (this.currentlyChosen === this.myid);
                this.amCaught = false;
                this.scene.fadeOutAndStartScene('scifi');
                break;
            case 11: // Left
                this.playerManager.remove(message.id);
                this.otherPlayers.splice(this.otherPlayers.findIndex((i) => i.id === message.id), 1);
                this.updateHost();
                break;
            case 14: // Caught
                if (message.id === this.myid) {
                    this.amCaught = true;
                }
                else {
                    this.playerManager.catch(message.id);
                }
                break;
            case 15: // Scores
                this.scene.fadeOutAndStartScene('score', message.scores);
                break;
        }
    }
    /**
     * Adds remote players to a scene.
     */
    setScene(scene) {
        this.scene = scene;
        this.playerManager.removeAll();
        for (var player of this.otherPlayers) {
            //spawn at (100, 100) if round started or server specified coords if in holding area
            let x = (this.gameStarted) ? 100 : player.x;
            let y = (this.gameStarted) ? 100 : player.y;
            this.playerManager.add(x, y, player.id, player.username, this.scene);
        }
        if (this.currentlyChosen !== undefined && this.currentlyChosen !== this.myid) {
            this.playerManager.choose(this.currentlyChosen);
        }
    }
    /**
     * Send the player's current velocity and position.
     */
    sendVelocityAndPosition(velX, velY, x, y) {
        this.communicator.send({
            type: 5, id: this.myid, velocityX: velX, velocityY: velY, x: x, y: y
        });
    }
    /**
     * Set the position and velocity of a remote player based on
     * a velocity update message.
     */
    updateRemotePlayer(message) {
        if (message.id !== this.myid) {
            this.playerManager.velocityUpdate(message);
        }
    }
    /**
     * Adds a new player to the scene based on a new player message.
     */
    addNewPlayer(message) {
        this.otherPlayers.push({
            id: message.id, username: message.username,
            x: message.x, y: message.y
        });
        this.playerManager.add(message.x, message.y, message.id, message.username, this.scene);
    }
    /**
     * Delete the remote player sprites and disconnect from the server.
     */
    leave() {
        this.playerManager.removeAll();
        this.otherPlayers = undefined;
        if (this.communicator !== undefined) {
            this.communicator.close();
            this.communicator = undefined;
        }
        this.inLobby = false;
        this.currentlyChosen = undefined;
        this.scene = undefined;
    }
    /**
     * Send a message to tell the server to start the game when in
     * holding area. Only has any effect if you are host and are in
     * holding area.
     */
    sendStartMessage() {
        if (this.amHost) {
            this.communicator.send({
                type: 8, id: this.myid,
                properties: {
                    runnerVision: Number(document.getElementById("runnerVision").value),
                    chaserVision: Number(document.getElementById("chaserVision").value),
                    runnerSpeed: Number(document.getElementById("runnerSpeed").value),
                    chaserSpeed: Number(document.getElementById("chaserSpeed").value),
                    waitTime: Number(document.getElementById("waitTime").value),
                    roundLength: Number(document.getElementById("roundLength").value),
                    map: Number(document.getElementById("map").value),
                }
            });
        }
    }
    /**
     * Update the position of all the remote players' nametags.
     */
    updateNametags() {
        this.playerManager.updateNametags();
    }
    /**
    * Called when space pressed. If local player is the catcher and is
    * within required distance of other player, sends a 'catch' message
    * to the server with the other player's ID.
    */
    catch(playerX, playerY) {
        if (this.amChosen) {
            let [closestDist, closestId] = this.playerManager.getClosestPlayer(playerX, playerY);
            if (closestDist < 80) {
                this.communicator.send({
                    type: 13, id: this.myid, caughtId: closestId
                });
            }
        }
    }
    /**
     * Returns true if the game has started, false if the player's
     * still in the holding area.
     */
    get gameStarted() {
        return this.currentlyChosen !== undefined;
    }
    /** Update amHost and hostChangedFlag, check if I'm now the host */
    updateHost() {
        let hostId = this.otherPlayers.reduce((m, c) => m = Math.min(m, c.id), this.myid);
        let amNowHost = (hostId === this.myid);
        if (amNowHost !== this.amHost) {
            this.hostChangedFlag = true;
        }
        this.amHost = amNowHost;
    }
}
