package com.gameServer;

import java.util.HashMap;
import javax.websocket.Session;

public class DataStorer {
	public static HashMap<String, Lobby> lobbies = new HashMap<String, Lobby>();
	public static HashMap<Integer, String> players = new HashMap<Integer, String>();
	public static int idCounter = 0;
	public static HashMap<Session, Integer> assignedIds = new HashMap<Session, Integer>();
}
