package me.schawe.multijsnake;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.ai.AutopilotDescription;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class GameController {
    private final GameStateMap map;

    GameController(GameStateMap map, WebSocketService webSocketService) {
        this.map = map;
    }

    @PostMapping("/api/init/{w}/{h}/{seed}")
    GameState init(@PathVariable int w, @PathVariable int h, @PathVariable long seed) {
        return map.newGameState(w, h, seed);
    }

    @PostMapping("/api/init/{w}/{h}")
    GameState init(@PathVariable int w, @PathVariable int h) {
        return map.newGameState(w, h);
    }

    @PostMapping("/api/init")
    GameState init() {
        return init(10, 10);
    }

    @PostMapping("/api/close/{id}")
    ResponseEntity<?> init(@PathVariable String id) {
        map.close(id);
        return ResponseEntity.ok("");
    }

    @GetMapping("/api/listAi")
    List<AutopilotDescription> listAi() {
        return map.listAi();
    }

    @MessageMapping("/pause")
    void pause(@Header("simpSessionId") String sessionId) {
        map.pause(sessionId);
    }

    @MessageMapping("/unpause")
    void unpause(@Header("simpSessionId") String sessionId) {
        map.unpause(sessionId);
    }

    @MessageMapping("/reset")
    void reset(@Header("simpSessionId") String sessionId) {
        map.reset(sessionId);
    }

    @MessageMapping("/join")
    void join(@Header("simpSessionId") String sessionId, String id) {
        map.join(sessionId, id);
    }

    @MessageMapping("/move")
    void move(@Header("simpSessionId") String sessionId, Move move) {
        map.move(sessionId, move);
    }

    @MessageMapping("/setName")
    void setName(@Header("simpSessionId") String sessionId, String name) {
        map.setName(sessionId, name);
    }

    @MessageMapping("/addAI")
    void addAI(@Header("simpSessionId") String sessionId, String type) {
        map.addAI(sessionId, type);
    }
}
