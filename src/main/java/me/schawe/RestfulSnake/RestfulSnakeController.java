package me.schawe.RestfulSnake;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    private final GameStateMap map;
    private final WebSocketService webSocketService;

    RestfulSnakeController(GameStateMap map, WebSocketService webSocketService) {
        this.map = map;
        this.webSocketService = webSocketService;
    }

    @PostMapping("/api/init/{w}/{h}")
    WrapIdAndState init(@PathVariable int w, @PathVariable int h) {
        GameState gameState = new GameState(w, h);
        map.put(gameState.id, gameState);

        return new WrapIdAndState(0, gameState);
    }

    @PostMapping("/api/init")
    WrapIdAndState init() {
        return init(10, 10);
    }

    @PostMapping("/api/{id}/join")
    WrapIdAndState join(@PathVariable String id) {
        GameState gameState = map.get(id);
        int idx = gameState.addSnake();

        return new WrapIdAndState(idx, gameState);
    }

    @MessageMapping("/pause")
    void pause(String id) {
        GameState gameState = map.get(id);
        gameState.setPause(true);
        webSocketService.manualUpdate(id);
    }

    @MessageMapping("/unpause")
    void unpause(String id) {
        GameState gameState = map.get(id);
        gameState.setPause(false);
        webSocketService.manualUpdate(id);
    }

    @MessageMapping("/reset")
    GameState reset(String id) {
        GameState gameState = map.get(id);
        gameState.reset();
        webSocketService.manualUpdate(id);

        return gameState;
    }

    @MessageMapping("/move")
    public void send(WrapMove move) {
        GameState gameState = map.get(move.getId());
        gameState.turn(move.getIdx(), move.getMove());
    }
}
