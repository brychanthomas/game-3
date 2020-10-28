package com.gameServer;

import java.io.IOException;
import java.util.HashMap;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.JsonObject;
import com.google.gson.JsonArray;

@ServerEndpoint("/websocketendpoint")
public class Game3Server {
	
	@OnOpen
	public void onOpen(Session s) {
		System.out.println("ID "+DataStorer.idCounter+" connected");
		String message = "{\"type\": 1, \"idAssign\": "+DataStorer.idCounter+"}";
		try {
			s.getBasicRemote().sendText(message);
		} catch (IOException e) {
			System.out.println("ERR: IOException when trying to assign ID");
		}
		DataStorer.idCounter++;
	}
	
	@OnClose
	public void onClose() {
		System.out.println("Close connection...");
	}
	
	@OnMessage
	public String onMessage(String message){
	    System.out.println("Message from the client: " + message);
	    String echoMsg = "Echo from the server : " + message;
	    return echoMsg;
	}
	
	@OnError
	public void onError(Throwable e){
	    e.printStackTrace();
	}
}
