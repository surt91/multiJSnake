package me.schawe.multijsnake;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;

import static me.schawe.multijsnake.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
public class WebSocketService {
    private final SimpMessagingTemplate websocket;
    private final GameStateMap map;

    @Autowired
    public WebSocketService(SimpMessagingTemplate websocket, GameStateMap map) {
        this.websocket = websocket;
        this.map = map;
    }

    @Scheduled(fixedRate = 300)
    void periodicUpdate() {
        Set<String> ids = map.allIds();
        for (String id : ids) {
            GameState gameState = map.get(id);
            if(!gameState.paused && !gameState.gameOver) {
                gameState.update();
                this.websocket.convertAndSend(
                        MESSAGE_PREFIX + "/update/" + id, gameState);
            }
        }
    }

    void manualUpdate(String id) {
        GameState gameState = map.get(id);
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/update/" + id, gameState);
    }
}
