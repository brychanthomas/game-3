package com.gameServer;

import java.util.HashMap;

/** Class for creating objects representing message from client, used to decode JSON */
public class MessageTemplate {
	public int type = -1;
	public int id = -1;
	public String lobbyCode;
	public String username;
	public double velocityX = -1;
	public double velocityY = -1;
	public double x = -1;
	public double y = -1;
	public HashMap<String, Double> properties;
	public int caughtId = -1;
	
	public String toString() {
		return "type: "+type+", id: "+id+", lobbyCode: "+lobbyCode+", username: "+username
				+", properties: "+properties;
	}
	
	/** Checks if message has required parameters for its type and that type is valid*/
	public boolean isValid() {
		if (id == -1) {
			return false;
		}
		switch (type) {
			
			case 2:
				if (lobbyCode != null && username != null) {
					return true;
				}
				break;
			
			case 5:
				if (velocityX != -1 && velocityY != -1 && x > 0 && y > 0) {
					return true;
				}
				break;
				
			case 8:
				if (properties != null) {
					if (properties.containsKey("runnerVision") &&
							properties.containsKey("chaserVision") &&
							properties.containsKey("runnerSpeed") &&
							properties.containsKey("chaserSpeed") &&
							properties.containsKey("roundLength") &&
							properties.containsKey("waitTime") &&
							properties.containsKey("map")) {
						return true;
					}
				}
				break;
				
			case 13:
				if(caughtId != -1) {
					return true;
				}
				break;
		}
		return false;
	}
}
