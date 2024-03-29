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
import com.google.gson.JsonElement;

@ServerEndpoint("/ep")
public class Game3Server {
	
	@OnOpen
	public void onOpen(Session session) {
		System.out.println("ID "+DataStorer.idCounter+" connected");
		String message = "{\"type\": 1, \"idAssign\": "+DataStorer.idCounter+"}"; //assign ID
		DataStorer.assignedIds.put(session, DataStorer.idCounter); //store ID for session
		try {
			session.getBasicRemote().sendText(message);
		} catch (IOException e) {
			System.out.println("ERR: IOException when trying to assign ID");
		}
		DataStorer.idCounter++;
	}
	
	@OnClose
	public void onClose(Session session) {
		int id = DataStorer.assignedIds.get(session);
		String lobbyCode = DataStorer.players.get(id);
		Lobby lobby = DataStorer.lobbies.get(lobbyCode);
		if (lobby != null) {
			System.out.println("ID "+id+" disconnected");
			DataStorer.assignedIds.remove(session); //remove stored session-id mapping
			DataStorer.players.remove(id); //remove stored ID-lobby code mapping
			lobby.removePlayer(id); //remove player from lobby
			if (lobby.numPlayers() == 0) { //if lobby is empty
				DataStorer.lobbies.remove(lobbyCode); //remove lobby
				System.out.println("Removed lobby "+lobbyCode);
				return;
			}
			JsonObject leftMessage = new JsonObject();
			leftMessage.addProperty("type", 11);
			leftMessage.addProperty("id", id);
			lobby.broadcast(leftMessage); //send left message to others in lobby
		}
	}
	
	@OnMessage
	public void onMessage(String message, Session conn){
		Gson gson = new Gson(); 
		MessageTemplate decoded;
		try {
			decoded = gson.fromJson(message, MessageTemplate.class); //decode JSON message
		} catch (Exception e) {
			System.out.println("WARN: '"+e.getClass()+"' when decoding message");
			return;
		}
		
		//client sent empty string
		if(decoded == null) {
			return;
		}
		
	    //if message is not from ID it is claiming to be from
	    if(DataStorer.assignedIds.get(conn) != decoded.id) {
	    	System.out.println("WARN: Client sent message with incorrect id");
	    	return;
	    }
	    
	    if (decoded.type != 2 && !DataStorer.lobbies.containsKey(DataStorer.players.get(decoded.id))) {
	    	System.out.println("WARN: Message type "+decoded.type+" sent by player not in lobby");
	    	return;
	    }
	    
	    if (!decoded.isValid()) {
	    	System.out.println("WARN: Message marked as invalid");
	    	return;
	    }
	    
	    Lobby lobby;
	    switch	(decoded.type) {
	    
	    	case 2: //lobby join request
	    		if (!DataStorer.lobbies.containsKey(decoded.lobbyCode)) {
	    			DataStorer.lobbies.put(decoded.lobbyCode, new Lobby());
	    			System.out.println("Created lobby "+decoded.lobbyCode);
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
	    			reply = new JsonObject(); //welcome message
	    			reply.addProperty("type", 3);
	    			reply.add("lobby", lobby.encode());
	    			JsonElement gameProps = gson.toJsonTree(lobby.gameProperties);
	    			reply.add("properties", gameProps);
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
	    		if (lobby.currentlyChosen == decoded.id && lobby.chaserWaiting && (decoded.velocityX != 0 || decoded.velocityY != 0)) {
	    			System.out.println("WARN: Chaser is moving while waiting");
	    			return;
	    		}
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
	    		
	    	case 7: //display properties
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.id));
	    		if (lobby.getHostId() == decoded.id) {
	    			JsonObject displayMessage = new JsonObject();
	    			displayMessage.addProperty("type", 7);
	    			JsonElement props = gson.toJsonTree(decoded.properties);
	    			displayMessage.add("properties", props);
	    			lobby.broadcast(displayMessage);
	    			lobby.gameProperties = decoded.properties;
	    		}
	    		break;
	    		
	    	case 8: //start game
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.id));
	    		if (lobby.getHostId() == decoded.id) { 
		    		lobby.gameProperties = decoded.properties;
		    		lobby.startNextRound();
	    		}
	    		break;
	    		
	    	case 13: //catch
	    		lobby = DataStorer.lobbies.get(DataStorer.players.get(decoded.id));
		    	if (decoded.id == lobby.currentlyChosen && lobby.containsId(decoded.caughtId) && !lobby.chaserWaiting) { 
		    		JsonObject caughtMessage = new JsonObject();
		    		caughtMessage.addProperty("type", 14);
		    		caughtMessage.addProperty("id", decoded.caughtId);
		    		lobby.broadcast(caughtMessage);
		    		lobby.incrementChaserScore();
		    	}
		    	break;
		    	
	    }
	}
	
	@OnError
	public void onError(Throwable e){
	    e.printStackTrace();
	}
}
