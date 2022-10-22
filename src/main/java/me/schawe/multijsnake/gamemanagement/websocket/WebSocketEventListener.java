package me.schawe.multijsnake.gamemanagement.websocket;

import me.schawe.multijsnake.gamemanagement.GameService;
import me.schawe.multijsnake.snake.GameState;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
    private final GameService gameService;
    private final WebSocketService webSocketService;

    public WebSocketEventListener(GameService gameService, WebSocketService webSocketService) {
        this.gameService = gameService;
        this.webSocketService = webSocketService;
    }

    @EventListener
    public void onDisconnectEvent(SessionDisconnectEvent event) {
        gameService.findPlayerBySession(event.getSessionId()).ifPresent(playerInfo -> {
            GameState gameState = gameService.idToGame(playerInfo.getGameId());
            gameState.kill(playerInfo.snakeId());
            gameState.markForRemoval(playerInfo.snakeId());
            webSocketService.update(gameState);
        });
    }
}