# game-3
This is a multiplayer chasing game created with the Phaser 3 game engine in TypeScript and a Java server that uses WebSockets to 
communicate with clients.

To start the game you must join a lobby. The host (first person to join a lobby) controls parameters such as movement speed and vision 
radius. When they start the game a person is randomly selected to be the chaser. They must try to catch the other players who run 
around the map. They get a point for each person they catch. A round is performed for each person with a different person acting 
as the chaser each time. The player with most points at the end wins.
