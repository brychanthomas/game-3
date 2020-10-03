import { RemotePlayer } from './player.js';
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
var MultiplayerHandler = /** @class */ (function () {
    function MultiplayerHandler(scene) {
        var address = prompt("Enter server address:", "localhost:5000");
        var username = prompt("Enter username:");
        this.communicator = new Communicator(address, this.onMessage.bind(this));
        this.scene = scene;
        this.players = [];
    }
    MultiplayerHandler.prototype.onMessage = function (raw) {
        var message = JSON.parse(raw.data);
        if (message.idAssign !== undefined) {
            this.id = message.idAssign;
            var lobbyCode = prompt("Enter lobby code:");
            this.communicator.send({ 'id': this.id, 'join': lobbyCode });
        }
        else if (message.lobby !== undefined) {
            for (var _i = 0, _a = message.lobby; _i < _a.length; _i++) {
                var player = _a[_i];
                this.players.push(new RemotePlayer(player.x, player.y, player.id, this.scene));
            }
        }
        else if (message.newid !== undefined) {
            this.players.push(new RemotePlayer(0, 0, message.newid, this.scene));
        }
        else if (message.x !== undefined && message.y !== undefined && message.id !== this.id) {
            console.log(message.id);
            console.log(this.players);
            var player = this.players.find(function (p) { return p.id === message.id; });
            player.x = message.x;
            player.y = message.y;
        }
    };
    MultiplayerHandler.prototype.sendPosition = function (x, y) {
        this.communicator.send({ 'id': this.id, 'x': x, 'y': y });
    };
    return MultiplayerHandler;
}());
export { MultiplayerHandler };
