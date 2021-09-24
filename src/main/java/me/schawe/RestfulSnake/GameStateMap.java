package me.schawe.RestfulSnake;

import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameStateMap {
    private final ConcurrentHashMap<String, GameState> map = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SnakeId> sessionMap = new ConcurrentHashMap<>();

    GameState get(String id) {
        if(!map.containsKey(id)) {
            throw new InvalidMapException(id);
        }

        return map.get(id);
    }


    SnakeId session2id(String sessionId) {
        if(!sessionMap.containsKey(sessionId)) {
            throw new InvalidMapException("");
        }

        return sessionMap.get(sessionId);
    }

    void put(String id, GameState state) {
        map.put(id, state);
    }

    void putSession(String sessionId, SnakeId id) {
        sessionMap.put(sessionId, id);
    }

    public Set<String> allIds() {
        return map.keySet();
    }
}
