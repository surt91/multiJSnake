package me.schawe.multijsnake;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.SnakeId;
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
        GameState gameState = gameStateMap.get(snakeId.getId());
        gameState.kill(snakeId.getIdx());
        gameState.markForRemoval(snakeId.getIdx());
        webSocketService.update(gameState);
    }
}