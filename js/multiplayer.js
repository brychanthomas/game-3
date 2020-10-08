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
    }
    send(data) {
        this.websocket.send(JSON.stringify(data));
    }
    close() {
        this.websocket.close(1000, "Leaving lobby");
    }
}
/**
 * Creates and manages multiplayer sprites and communication.
 */
export class MultiplayerHandler {
    constructor() {
        this.playerSprites = [];
        this.inLobby = false;
    }
    /**
     * Connect to a server and join a lobby. Returns a promise.
     */
    join(address, lobbyCode, username) {
        this.lobbyCode = lobbyCode;
        this.username = username;
        return new Promise(function (resolve, reject) {
            this.communicator = new Communicator(address, this.onMessage.bind(this));
            var timeWaited = 0;
            function checkIfConnected() {
                if (this.inLobby) {
                    resolve();
                }
                else {
                    timeWaited += 250;
                    if (timeWaited >= 5000) {
                        reject();
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
        console.log(message);
        switch (message.type) {
            case 1: // ID assign
                this.myid = message.idAssign;
                this.communicator.send({
                    type: 2, id: this.myid, lobbyCode: this.lobbyCode, username: this.username
                });
                break;
            case 3: // Player listing
                this.otherPlayers = message.lobby;
                this.inLobby = true;
                break;
            case 5: // Velocity update from another player
                this.updateRemotePlayer(message);
                break;
            case 6: // New player joined lobby
                this.addNewPlayer(message);
                break;
        }
    }
    /**
     * Adds remote players to a scene.
     */
    setScene(scene) {
        this.scene = scene;
        setTimeout(function () {
            console.log(this.otherPlayers);
            for (var player of this.otherPlayers) {
                this.playerSprites.push(new RemotePlayer(player.x, player.y, player.id, this.scene));
            }
        }.bind(this), 1000);
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
        var player = this.playerSprites.find((p) => p.id === message.id);
        player.velocityX = message.velocityX;
        player.velocityY = message.velocityY;
        player.x = message.x;
        player.y = message.y;
    }
    /**
     * Adds a new player to the scene based on a new player message.
     */
    addNewPlayer(message) {
        this.otherPlayers.push({
            id: message.id, username: message.username,
            x: message.x, y: message.y
        });
        this.playerSprites.push(new RemotePlayer(message.x, message.y, message.id, this.scene));
    }
    /**
     * Delete the remote player sprites and disconnect from the server.
     */
    leave() {
        for (var p of this.playerSprites) {
            p.destroy();
        }
        this.otherPlayers = undefined;
        if (this.communicator !== undefined) {
            this.communicator.close();
        }
        this.inLobby = false;
    }
}
