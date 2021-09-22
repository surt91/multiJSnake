package me.schawe.RestfulSnake;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    HashMap<String, GameState> map = new HashMap<>();

    @PostMapping("/init")
    GameState init() {
        GameState gameState = new GameState();
        map.put(gameState.id, gameState);

        return gameState;
    }

    @PostMapping("/{id}/move/{move}")
    GameState move_step(@PathVariable String id, @PathVariable Move move) {
        if(!map.containsKey(id)) {
            throw new InvalidMapException(id);
        }
        GameState gameState = map.get(id);
        gameState.update(move);

        return gameState;
    }
}
