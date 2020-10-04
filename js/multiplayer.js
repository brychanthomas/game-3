/**
 * Opens a WebSocket connection for sending and receiving
 * data.
 */
var Communicator = /** @class */ (function () {
    function Communicator(address, messageCallback) {
        this.serverAddress = address;
        this.websocket = new WebSocket('ws://' + this.serverAddress);
        this.websocket.onmessage = messageCallback;
    }
    Communicator.prototype.send = function (data) {
        this.websocket.send(JSON.stringify(data));
    };
    return Communicator;
}());
/**
 * Creates and manages multiplayer sprites and communication.
 */
var MultiplayerHandler = /** @class */ (function () {
    function MultiplayerHandler() {
    }
    return MultiplayerHandler;
}());
export { MultiplayerHandler };
