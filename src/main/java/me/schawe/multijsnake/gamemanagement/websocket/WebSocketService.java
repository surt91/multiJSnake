package me.schawe.multijsnake.gamemanagement.websocket;

import me.schawe.multijsnake.gamemanagement.player.PlayerInfo;
import me.schawe.multijsnake.gamemanagement.player.PlayerInfoForClient;
import me.schawe.multijsnake.highscore.HighscoreRepository;
import me.schawe.multijsnake.snake.GameState;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static me.schawe.multijsnake.gamemanagement.websocket.WebSocketConfiguration.MESSAGE_PREFIX;

@Component
public class WebSocketService {
    private final SimpMessagingTemplate websocket;
    private final HighscoreRepository repo;

    public WebSocketService(SimpMessagingTemplate websocket, HighscoreRepository repo) {
        this.websocket = websocket;
        this.repo = repo;
    }

    public void update(GameState gameState) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/update/" + gameState.getId(), gameState);
    }

    public void updateHighscore(int size) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newHighscore", repo.findTop10ByFieldSizeOrderByScoreDesc(size));
    }

    public void updateGlobalHighscore() {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newGlobalHighscore", repo.findTop10ByOrderByScoreDesc());
    }

    public void notifyJoined(PlayerInfo playerInfo) {
        PlayerInfoForClient payload = new PlayerInfoForClient(playerInfo);
        System.out.println("notify" + playerInfo);
        this.websocket.convertAndSendToUser(
                playerInfo.getSessionId(),
                "/queue/joined",
                payload,
                createHeaders(playerInfo.getSessionId())
        );
    }

    private MessageHeaders createHeaders(String sessionId) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
        headerAccessor.setSessionId(sessionId);
        headerAccessor.setLeaveMutable(true);
        return headerAccessor.getMessageHeaders();
    }
}
