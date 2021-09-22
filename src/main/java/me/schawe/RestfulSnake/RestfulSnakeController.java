package me.schawe.RestfulSnake;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    private GameStateMap map;

    RestfulSnakeController(GameStateMap map) {
        this.map = map;
    }

    @PostMapping("/api/init")
    GameState init() {
        GameState gameState = new GameState();
        map.put(gameState.id, gameState);

        return gameState;
    }

    @PostMapping("/api/pause")
    void pause() {
        // TODO
        //GameState gameState = new GameState();
        //map.put(gameState.id, gameState);

        //return gameState;
    }

    @PostMapping("/api/unpause")
    void unpause() {
        // TODO
        //GameState gameState = new GameState();
        //map.put(gameState.id, gameState);

        //return gameState;
    }

    @PostMapping("/api/{id}/move/{move}")
    GameState move_step(@PathVariable String id, @PathVariable Move move) {
        if(!map.containsKey(id)) {
            throw new InvalidMapException(id);
        }
        GameState gameState = map.get(id);
        // gameState.update(move);

        return gameState;
    }
}
