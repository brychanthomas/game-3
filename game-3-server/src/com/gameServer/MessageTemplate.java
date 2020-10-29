package com.gameServer;

import java.util.HashMap;

/** Class for creating objects representing message from client, used to decode JSON */
public class MessageTemplate {
	public int type;
	public int id;
	public String lobbyCode;
	public String username;
	public double velocityX;
	public double velocityY;
	public double x;
	public double y;
	public HashMap<String, Double> properties;
	public int caughtId;
	
	public String toString() {
		return "type: "+type+", id: "+id+", lobbyCode: "+lobbyCode+", username: "+username
				+", properties: "+properties;
	}
}
