package me.schawe.multijsnake;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameStateMap {
    private final ConcurrentHashMap<String, GameState> gameStateMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, SnakeId> sessionMap = new ConcurrentHashMap<>();
    private final WebSocketService webSocketService;
    private final HighscoreRepository highscoreRepository;

    GameStateMap(WebSocketService webSocketService, HighscoreRepository highscoreRepository) {
        this.webSocketService = webSocketService;
        this.highscoreRepository = highscoreRepository;
    }

    public GameState newGameState(int w, int h) {
        GameState gameState = new GameState(x -> updateHighscore(x, w*h), w, h);
        gameStateMap.put(gameState.id, gameState);
        return gameState;
    }

    @Scheduled(fixedRate = 300)
    void periodicUpdate() {
        Set<String> ids = allIds();
        for (String id : ids) {
            GameState gameState = gameStateMap.get(id);
            if(!gameState.paused && !gameState.gameOver) {
                gameState.update();
                webSocketService.update(gameState);
            }
        }
    }

    private void updateHighscore(Snake snake, int size) {
        System.out.println("update Highscore");
        Date date = new Date();
        Highscore highscore = new Highscore(snake.getLength(), snake.name, size, date);
        System.out.println(highscore);
        highscoreRepository.save(highscore);
        webSocketService.updateHighscore(size);
        webSocketService.updateGlobalHighscore();
    }

    GameState get(String id) {
        if(!gameStateMap.containsKey(id)) {
            throw new InvalidMapException(id);
        }

        return gameStateMap.get(id);
    }

    SnakeId session2id(String sessionId) {
        if(!sessionMap.containsKey(sessionId)) {
            throw new InvalidMapException("");
        }

        return sessionMap.get(sessionId);
    }

    void put(String id, GameState state) {
        gameStateMap.put(id, state);
    }

    void putSession(String sessionId, SnakeId id) {
        sessionMap.put(sessionId, id);
    }

    public Set<String> allIds() {
        return gameStateMap.keySet();
    }

    public void pause(String sessionId) {
        SnakeId snakeId = session2id(sessionId);
        GameState state = get(snakeId.id);
        state.setPause(true);
        webSocketService.update(state);
    }

    public void unpause(String sessionId) {
        SnakeId snakeId = session2id(sessionId);
        GameState state = get(snakeId.id);
        state.setPause(false);
        webSocketService.update(state);
    }

    public void reset(String sessionId) {
        SnakeId snakeId = session2id(sessionId);
        GameState state = get(snakeId.id);
        state.reset();
        webSocketService.update(state);
    }

    public void join(String sessionId, String id) {
        int idx = get(id).addSnake();

        putSession(sessionId, new SnakeId(id, idx));
        GameState state = get(id);

        webSocketService.update(state);
        webSocketService.updateHighscore();
        webSocketService.publishIdx(sessionId, idx);
    }

    public void move(String sessionId, Move move) {
        SnakeId snakeId = session2id(sessionId);
        get(snakeId.id).turn(snakeId.idx, move);
    }

    public void setName(String sessionId, String name) {
        SnakeId snakeId = session2id(sessionId);
        GameState state = get(snakeId.id);
        state.changeName(snakeId.idx, name);

        webSocketService.update(state);
    }

    public void addAI(String sessionId, String type) {
        SnakeId snakeId = session2id(sessionId);
        GameState state = get(snakeId.id);
        // TODO
    }
}
