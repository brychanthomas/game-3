package com.gameServer;

import java.util.TimerTask;

/** TimerTask with lobbyCode parameter so that it can call method on a specific lobby */
public class NextRoundTimerTask extends TimerTask {
	
	String lobbyCode;
	
	public NextRoundTimerTask(String code) {
		lobbyCode = code;
	}
	
	public void run() {
		DataStorer.lobbies.get(lobbyCode).startNextRound();
	}

}
