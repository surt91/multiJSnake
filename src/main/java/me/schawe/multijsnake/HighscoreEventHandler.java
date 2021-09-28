package me.schawe.multijsnake;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import javax.persistence.PostPersist;

import static me.schawe.multijsnake.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
public class HighscoreEventHandler {

    private SimpMessagingTemplate websocket;

    private HighscoreRepository repo;

    public HighscoreEventHandler(SimpMessagingTemplate websocket, HighscoreRepository repo) {
        this.websocket = websocket;
        this.repo = repo;
    }

    public HighscoreEventHandler() {

    }

    @PostPersist
    public void newHighscore(Highscore highscore) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newHighscore", repo.findTop10ByOrderByScoreDesc());
    }
}
