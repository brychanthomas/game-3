package com.gameServer;

import javax.websocket.Session;
import java.io.IOException;
import com.google.gson.JsonObject;

/**
 * Class representing a single player with a WebSocket connection, id, coordinates
 * and a username
 */
public class Player {
	/** The WebSocket session that the player is using to communicate */
	public Session _connection;
	/** The ID assigned to the player */
	public int _id;
	/** The last reported x coordinate of the player */
	public double _x;
	/** The last reported y coordinate of the player */
	public double _y;
	/** The player's username */
	public String _username;
	
	public Player (Session connection, int id, String username) {
		_connection = connection;
		_id = id;
		_username = username;
	}
	
	/** Returns the properties of the player as a JsonObject */
	public JsonObject encode() {
		JsonObject jo = new JsonObject();
		jo.addProperty("id", _id);
		jo.addProperty("x", _x);
		jo.addProperty("y", _y);
		jo.addProperty("username", _username);
		return jo;
	}
	
	/** Send a string to the player over their WebSocket connection */
	public void send(String message) {
		if (_connection.isOpen()) {
			try { _connection.getBasicRemote().sendText(message); }
			catch (IOException e) { e.printStackTrace(); }
		}
	}
	
	public boolean equals (Object o) {
		if (((Player)o)._id == _id && ((Player)o)._connection == _connection) {
			return true;
		}
		return false;
	}
}
