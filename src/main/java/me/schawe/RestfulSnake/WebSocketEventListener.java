package me.schawe.RestfulSnake;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Component
public class WebSocketEventListener {
    GameStateMap gameStateMap;
    WebSocketService webSocketService;

    public WebSocketEventListener(GameStateMap gameStateMap, WebSocketService webSocketService) {
        this.gameStateMap = gameStateMap;
        this.webSocketService = webSocketService;
    }

    @EventListener
    public void onDisconnectEvent(SessionDisconnectEvent event) {
        System.out.println(event.getSessionId());
        SnakeId snakeId = gameStateMap.session2id(event.getSessionId());
        GameState gameState = gameStateMap.get(snakeId.id);
        gameState.kill(snakeId.idx);
        webSocketService.manualUpdate((snakeId.id));
    }
}