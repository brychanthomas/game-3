package com.gameServer;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

import java.util.ArrayList;
import java.util.HashMap;
import java.io.IOException;
import java.lang.Math;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;

public class Lobby {
	
	private ArrayList<Player> players;
	private String lobbyCode;
	private boolean gameStarted;
	private HashMap<Integer, Integer> scores;
	private ArrayList<Integer> idsLeft;
	public  JsonObject gameProperties;
	private int currentlyChosen;
	public  double nextRoundTime;
	
	public Lobby (String code) {
		players = new ArrayList<Player>();
		lobbyCode = code;
		gameStarted = false;
		scores = new HashMap<Integer, Integer>();
		idsLeft = new ArrayList<Integer>();
	}
	
	/** Add player object to lobby */
	public void addPlayer(Player p) {
		if (!gameStarted) {
			players.add(p);
			this.scores.put(p._id, 0);
			idsLeft.add(p._id);
		}
	}
	
	/** Send JsonObject to all players in lobby */
	public void broadcast(JsonObject jo) {
		String message = jo.toString();
		for (Player p : players) {
			p.send(message);
		}
	}
	
	/** Encode the ArrayList of players as a JsonArray */
	public JsonArray encode() {
		JsonArray ja = new JsonArray();
		for (Player p : players) {
			ja.add(p.encode());
		}
		return ja;
	}
	
	public Player getPlayerById(int id) throws Exception {
		for (Player p : players) {
			if (p._id == id) {
				return p;
			}
		}
		throw new Exception("Player not found in lobby");
	}
	
	/** Set the position of a player as stored in its object. */
	public void setPosition(int id, int x, int y) {
		try {
			Player p = getPlayerById(id);
			p._x = x;
			p._y = y;
		} catch (Exception e) {
			System.out.println("ERR: Tried to update position of non-existent player");
		}
	}
	
	/** Select a random ID to be the next chaser from the IDs that haven't been chosen yet */
	public int chooseNextChaser() {
		if (players.size() > 0) {
			int id = (int)(Math.random() * players.size());
			idsLeft.remove((Integer)id);
			return id;
		}
		return -1;
	}
	
	/** Start the next round or the score screen and set the nextRoundTime */
	public void startNextRound() {
		int chosen = chooseNextChaser();
		if (chosen != -1) {
			JsonObject message = new JsonObject();
			message.addProperty("type", 9);
			message.add("properties", gameProperties);
			broadcast(message);
			gameStarted = true;
			message = new JsonObject();
			message.addProperty("type", 12);
			message.addProperty("id", chosen);
			currentlyChosen = chosen;
			nextRoundTime = ManagementFactory.getRuntimeMXBean().getUptime()
					+ this.gameProperties.get("roundLength").getAsInt()
					+ 500;
		} else {
			JsonObject message = new JsonObject();
			message.addProperty("type", 15);
			message.add("scores", getScores());
			broadcast(message);
			delete();
		}
	}
	
	private JsonArray getScores() {
		JsonArray ja = new JsonArray();
		for (Player p : players) {
			JsonObject jo = new JsonObject();
			jo.addProperty("username", p._username);
			jo.addProperty("score", scores.get((Integer)p._id));
			ja.add(jo);
		}
		return ja;
	}
	
	private void delete() {
		for (Player p: players) {
			try {
				p._connection.close();
			} catch (IOException e) {
				System.out.println("ERR: IOException when closing socket connection.");
			}
		}
	}
	
}
