package me.schawe.RestfulSnake;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Component
public class GameStateMap {
    private final HashMap<String, GameState> map = new HashMap<>();

    GameState get(String id) {
        return map.get(id);
    }

    void put(String id, GameState state) {
        map.put(id, state);
    }

    boolean containsKey(String id) {
        return map.containsKey(id);
    }

    public Set<String> allIds() {
        return map.keySet();
    }
}
