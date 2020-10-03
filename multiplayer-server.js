var WebSocket = require('ws');

const wss = new WebSocket.Server({port:5000});

var lobbies = {};

var id = 0;

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('Received '+message)
    message = JSON.parse(message);
    if (message.id !== undefined) {
      if (message.join !== undefined) { // join/create lobby
        if (lobbies[message.join] === undefined) { //if lobby does not exist
          lobbies[message.join] = [];
        }
        ws.send(JSON.stringify({'lobby':lobbies[message.join]})); //send existing lobby members
        lobbies[message.join].push({id: message.id, x:0, y:0}); //add new to lobby
        wss.clients.forEach((client) => { //send new id to existing lobbt members
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({'newid':message.id}));
          }
        });
      }
      if (message.x && message.y) { //if message has position information
        var relayed = JSON.stringify({'id':message.id, 'x':message.x, 'y':message.y});
        console.log('Relayed '+relayed);
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(relayed);
          }
        });
      }
    }
  });
  ws.send('{"idAssign":'+id+'}');
  id++;
});
