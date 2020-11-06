package com.gameServer;

import java.util.TimerTask;

/** TimerTask with lobbyCode parameter so that it can call method on a specific lobby */
public class NextRoundTimerTask extends TimerTask {
	
	Lobby lobby;
	
	public NextRoundTimerTask(Lobby l) {
		lobby = l;
	}
	
	public void run() {}

}
