package me.schawe.RestfulSnake;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

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
        SnakeId snakeId = gameStateMap.session2id(event.getSessionId());
        GameState gameState = gameStateMap.get(snakeId.id);
        gameState.kill(snakeId.idx);
        gameState.markForRemoval(snakeId.idx);
        webSocketService.manualUpdate((snakeId.id));
    }
}