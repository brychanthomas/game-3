package com.gameServer;

import java.io.IOException;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.JsonObject;
import com.google.gson.Gson;

@ServerEndpoint("/websocketendpoint")
public class Game3Server {
	
	@OnOpen
	public void onOpen(Session s) {
		System.out.println("ID "+DataStorer.idCounter+" connected");
		String message = "{\"type\": 1, \"idAssign\": "+DataStorer.idCounter+"}";
		DataStorer.assignedIds.put(DataStorer.idCounter, s);
		try {
			s.getBasicRemote().sendText(message);
		} catch (IOException e) {
			System.out.println("ERR: IOException when trying to assign ID");
		}
		DataStorer.idCounter++;
	}
	
	@OnClose
	public void onClose() {
		System.out.println("Close connection...");
	}
	
	@OnMessage
	public void onMessage(String message, Session conn){
		Gson gson = new Gson();
	    MessageTemplate decoded = gson.fromJson(message, MessageTemplate.class);
	    
	    //if message is not from ID it is claiming to be from
	    if(DataStorer.assignedIds.get(decoded.id) != conn) {
	    	System.out.println("WARN: Client sent message with incorrect id");
	    	return;
	    }
	    
	    Lobby lobby;
	    switch	(decoded.type) {
	    
	    	case 2: //lobby join request
	    		if (!DataStorer.lobbies.containsKey(decoded.lobbyCode)) {
	    			DataStorer.lobbies.put(decoded.lobbyCode, new Lobby(decoded.lobbyCode));
	    		}
	    		lobby = DataStorer.lobbies.get(decoded.lobbyCode);
	    		if (!lobby.gameStarted) {
	    			JsonObject reply = new JsonObject(); //new player message
	    			reply.addProperty("type", 6);
	    			reply.addProperty("id", decoded.id);
	    			reply.addProperty("username", decoded.username);
	    			reply.addProperty("x", 100);
	    			reply.addProperty("y", 100);
	    			lobby.broadcast(reply);
	    			Player player = new Player(conn, decoded.id, decoded.username);
	    			reply = new JsonObject(); //player listing
	    			reply.addProperty("type", 3);
	    			reply.add("lobby", lobby.encode());
					player.send(reply.toString());
					lobby.addPlayer(player);
					DataStorer.players.put(decoded.id, decoded.lobbyCode);
	    		} else {
	    			try {
	    				conn.getBasicRemote().sendText("{\"type\": 0, \"error\": \"Game has already started in this lobby\"}");
	    				conn.close();
	    			} catch (IOException e) {
	    				System.out.println("ERR: IOException when sending lobby started message");
	    			}
	    		}
	    		break;
	    		
	    	case 5: //velocity update
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.id));
	    		JsonObject velUpdate = new JsonObject();
	    		velUpdate.addProperty("type", 5);
	    		velUpdate.addProperty("id", decoded.id);
	    		velUpdate.addProperty("velocityX", decoded.velocityX);
	    		velUpdate.addProperty("velocityY", decoded.velocityY);
	    		velUpdate.addProperty("x", decoded.x);
	    		velUpdate.addProperty("y", decoded.y);
	    		lobby.broadcast(velUpdate);
	    		lobby.setPosition(decoded.id, decoded.x, decoded.y);
	    		break;
	    		
	    	case 8: //start game
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.id));
	    		lobby.gameProperties = decoded.properties;
	    		lobby.startNextRound();
	    		break;
	    		
	    	case 13: //catch
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.caughtId));
	    		JsonObject caughtMessage = new JsonObject();
	    		caughtMessage.addProperty("type", 14);
	    		caughtMessage.addProperty("id", decoded.caughtId);
	    		lobby.broadcast(caughtMessage);
	    		lobby.incrementChaserScore();
	    		break;
	    }
	}
	
	@OnError
	public void onError(Throwable e){
	    e.printStackTrace();
	}
}
