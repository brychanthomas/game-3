package com.gameServer;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import com.google.gson.Gson;
import com.google.gson.JsonElement;

import java.util.ArrayList;
import java.util.HashMap;
import java.io.IOException;
import java.lang.Math;

import java.util.Timer;

/**
 * Class representing a single lobby of players who play the game together
 */
public class Lobby {
	
	private ArrayList<Player> players;
	public  boolean gameStarted;
	private HashMap<Integer, Integer> scores;
	private ArrayList<Integer> idsLeft;
	public  HashMap<String, Double> gameProperties;
	public  int currentlyChosen;
	private Timer timer;
	public  boolean chaserWaiting;
	
	public Lobby () {
		players = new ArrayList<Player>();
		gameStarted = false;
		scores = new HashMap<Integer, Integer>();
		idsLeft = new ArrayList<Integer>();
		timer = new Timer();
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
	
	/** Find a Player object by its ID (used to set position) */
	private Player getPlayerById(int id) throws Exception {
		for (Player p : players) {
			if (p._id == id) {
				return p;
			}
		}
		throw new Exception("Player not found in lobby");
	}
	
	/** Set the position of a player stored in its object. */
	public void setPosition(int id, double x, double y) {
		try {
			Player p = getPlayerById(id);
			p._x = x;
			p._y = y;
		} catch (Exception e) {
			System.out.println("ERR: Tried to update position of non-existent player");
		}
	}
	
	/** Select a random ID to be the next chaser from the IDs that haven't been chosen yet */
	private int chooseNextChaser() {
		if (idsLeft.size() > 0) {
			int id = idsLeft.get((int)(Math.random() * idsLeft.size()));
			idsLeft.remove(Integer.valueOf(id));
			return id;
		}
		return -1;
	}
	
	/** Start the next round and schedule a task to start the
	 * round after that (or show the score screen) */
	public void startNextRound() {
		int chosen = this.chooseNextChaser();
		if (chosen != -1) {
			JsonObject message = new JsonObject();
			message.addProperty("type", 9);
			Gson gson = new Gson();
			JsonElement props = gson.toJsonTree(this.gameProperties);
			message.add("properties", props);
			message.addProperty("chosen", chosen);
			this.broadcast(message);
			this.gameStarted = true;
			this.currentlyChosen = chosen;
			this.chaserWaiting = true;
			
			this.timer.schedule(new NextRoundTimerTask(this) {
				@Override
				public void run() {
					if (lobby.numPlayers() > 0) {
						lobby.enableChaser();
					} else {
						this.cancel();
					}
				}
			}, (int)(this.gameProperties.get("waitTime")*1000));
			
		} else {
			JsonObject message = new JsonObject();
			message.addProperty("type", 15);
			message.add("scores", getScores());
			broadcast(message);
			disconnectAll();
		}
	}
	
	/** Get a JsonArray of JsonObjects containing the players' usernames and scores */
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
	
	/** Close all connections with players in the lobby and terminate the timer */
	private void disconnectAll() {
		ArrayList<Player> playersCopy = new ArrayList<Player>(players);
		for (Player p: playersCopy) {
			try {
				p._connection.close();
			} catch (IOException e) {
				System.out.println("ERR: IOException when closing socket connection.");
			}
		}
		this.timer.cancel();
	}
	
	/** Increase the score of the current chaser when player caught */
	public void incrementChaserScore() {
		scores.put(currentlyChosen, scores.get(currentlyChosen) + 1);
	}
	
	/** Check if specific ID is in this lobby */
	public boolean containsId(int id) {
		for (Player p : players) {
			if (p._id == id) {
				return true;
			}
		}
		return false;
	}
	
	/** Remove a specfic ID from the lobby */
	public void removePlayer(int id) {
		for (Player p : players) {
			if (p._id == id) {
				players.remove(p);
				idsLeft.remove(Integer.valueOf(id));
				return;
			}
		}
	}
	
	/** Get the number of players currently in the lobby */
	public int numPlayers() {
		return players.size();
	}
	
	/** Returns lowest ID in the lobby (the lowest ID is the host) */
	public int getHostId() {
		int lowestId = players.get(0)._id;
		for (Player p : players) {
			if (p._id < lowestId) {
				lowestId = p._id;
			}
		}
		return lowestId;
	}
	
	/** Called when wait time has finished */
	public void enableChaser() {
		chaserWaiting = false;
		this.timer.schedule(new NextRoundTimerTask(this) {
			@Override
			public void run() {
				if (lobby.numPlayers() > 0) {
					lobby.startNextRound();
				} else {
					this.cancel();
				}
			}
		}, (int)(this.gameProperties.get("roundLength")*1000)+1500);
	}
}
