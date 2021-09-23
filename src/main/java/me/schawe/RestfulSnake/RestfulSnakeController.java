package me.schawe.RestfulSnake;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    private final GameStateMap map;

    RestfulSnakeController(GameStateMap map) {
        this.map = map;
    }

    @PostMapping("/api/init")
    WrapIdAndState init() {
        GameState gameState = new GameState();
        map.put(gameState.id, gameState);

        return new WrapIdAndState(0, gameState);
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
    }

    @MessageMapping("/unpause")
    void unpause(String id) {
        GameState gameState = map.get(id);
        gameState.setPause(false);
    }

    @MessageMapping("/reset")
    GameState reset(String id) {
        GameState gameState = map.get(id);
        gameState.reset();

        return gameState;
    }

    @MessageMapping("/move")
    public void send(WrapMove move) throws Exception {
        GameState gameState = map.get(move.getId());
        gameState.turn(move.getIdx(), move.getMove());
    }
}
