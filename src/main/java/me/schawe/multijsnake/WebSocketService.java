package me.schawe.multijsnake;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
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

    public void updateHighscore() {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newHighscore", repo.findTop10ByOrderByScoreDesc());
    }

    public void publishIdx(String sessionId, int idx) {
        System.out.println("assign identity");
        System.out.println(sessionId);
        System.out.println(idx);
        this.websocket.convertAndSendToUser(
                sessionId,
                "/queue/getIdx",
                idx,
                createHeaders(sessionId)
        );
    }

    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}
