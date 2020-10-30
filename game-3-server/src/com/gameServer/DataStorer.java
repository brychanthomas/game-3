package com.gameServer;

import java.util.HashMap;
import javax.websocket.Session;

/** 
 * Class of static fields for storing data between connections
 */
public class DataStorer {
	/** Mapping of lobby code to Lobby object */
	public static HashMap<String, Lobby> lobbies = new HashMap<String, Lobby>();
	/** Mapping of player id to lobby code */
	public static HashMap<Integer, String> players = new HashMap<Integer, String>();
	/** Counter used to assign new IDs to new connections - incremented on each connection*/
	public static int idCounter = 0;
	/** Mapping of Session object to player ID assigned to that Session */
	public static HashMap<Session, Integer> assignedIds = new HashMap<Session, Integer>();
}
