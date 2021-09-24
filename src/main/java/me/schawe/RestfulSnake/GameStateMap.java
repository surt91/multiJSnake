package me.schawe.RestfulSnake;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameStateMap {
    private final ConcurrentHashMap<String, GameState> map = new ConcurrentHashMap<>();

    GameState get(String id) {
        if(!map.containsKey(id)) {
            throw new InvalidMapException(id);
        }

        return map.get(id);
    }

    void put(String id, GameState state) {
        map.put(id, state);
    }

    public Set<String> allIds() {
        return map.keySet();
    }
}
