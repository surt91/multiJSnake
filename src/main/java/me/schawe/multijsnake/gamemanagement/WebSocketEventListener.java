package me.schawe.multijsnake.gamemanagement;

import me.schawe.multijsnake.snake.GameState;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    private final GameStateMap gameStateMap;
    private final WebSocketService webSocketService;

    public WebSocketEventListener(GameStateMap gameStateMap, WebSocketService webSocketService) {
        this.gameStateMap = gameStateMap;
        this.webSocketService = webSocketService;
    }

    @EventListener
    public void onDisconnectEvent(SessionDisconnectEvent event) {
        gameStateMap.findPlayerBySession(event.getSessionId()).ifPresent(playerInfo -> {
            GameState gameState = gameStateMap.idToGame(playerInfo.getGameId());
            gameState.kill(playerInfo.getSnakeId());
            gameState.markForRemoval(playerInfo.getSnakeId());
            webSocketService.update(gameState);
        });
    }
}