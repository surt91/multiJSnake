package me.schawe.multijsnake;

import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

@RestController
public class RestfulSnakeController {
    private final GameStateMap map;
    private final WebSocketService webSocketService;

    RestfulSnakeController(GameStateMap map, WebSocketService webSocketService) {
        this.map = map;
        this.webSocketService = webSocketService;
    }

    @PostMapping("/api/init/{w}/{h}")
    GameState init(@PathVariable int w, @PathVariable int h) {
        GameState gameState = new GameState(w, h);
        map.put(gameState.id, gameState);

        return gameState;
    }

    @PostMapping("/api/init")
    GameState init() {
        return init(10, 10);
    }

    @MessageMapping("/pause")
    void pause(@Header("simpSessionId") String sessionId) {
        SnakeId snakeId = map.session2id(sessionId);
        GameState gameState = map.get((snakeId.id));
        gameState.setPause(true);
        webSocketService.manualUpdate((snakeId.id));
    }

    @MessageMapping("/unpause")
    void unpause(@Header("simpSessionId") String sessionId) {
        SnakeId snakeId = map.session2id(sessionId);
        GameState gameState = map.get((snakeId.id));
        gameState.setPause(false);
        webSocketService.manualUpdate((snakeId.id));
    }

    @MessageMapping("/reset")
    void reset(@Header("simpSessionId") String sessionId) {
        SnakeId snakeId = map.session2id(sessionId);
        GameState gameState = map.get((snakeId.id));
        gameState.reset();
        webSocketService.manualUpdate((snakeId.id));
    }

    @MessageMapping("/join")
    void join(@Header("simpSessionId") String sessionId, String id) {
        GameState gameState = map.get(id);
        int idx = gameState.addSnake();

        map.putSession(sessionId, new SnakeId(id, idx));

        webSocketService.manualUpdate(id);
    }

    @MessageMapping("/move")
    void send(@Header("simpSessionId") String sessionId, Move move) {
        SnakeId snakeId = map.session2id(sessionId);
        GameState gameState = map.get(snakeId.id);
        gameState.turn(snakeId.idx, move);
    }
}
