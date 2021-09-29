package me.schawe.multijsnake;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static me.schawe.multijsnake.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
public class WebSocketService {
    private final SimpMessagingTemplate websocket;
    private final HighscoreRepository repo;

    @Autowired
    public WebSocketService(SimpMessagingTemplate websocket, HighscoreRepository repo) {
        this.websocket = websocket;
        this.repo = repo;
    }

    void update(GameState gameState) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/update/" + gameState.id, gameState);
    }

    public void newHighscore() {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newHighscore", repo.findTop10ByOrderByScoreDesc());
    }
}
