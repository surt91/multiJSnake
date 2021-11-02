package me.schawe.multijsnake.gamemanagement;

import me.schawe.multijsnake.highscore.Highscore;
import me.schawe.multijsnake.highscore.HighscoreRepository;
import me.schawe.multijsnake.snake.*;
import me.schawe.multijsnake.snake.ai.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GameStateMap {
    private final WebSocketService webSocketService;
    private final HighscoreRepository highscoreRepository;

    private final ConcurrentHashMap<String, GameState> gameStateMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<PlayerId, PlayerInfo> playerInfoMap = new ConcurrentHashMap<>();

    private final Map<String, AutopilotDescription> aiDescriptionMap;

    private final Random random;

    GameStateMap(WebSocketService webSocketService, HighscoreRepository highscoreRepository) {
        this.webSocketService = webSocketService;
        this.highscoreRepository = highscoreRepository;

        this.aiDescriptionMap = aiDescriptions();

        random = new Random();
    }

    private GameState newGame(int width, int height, long seed) {
        GameState gameState = new GameState(width, height, seed);
        return initGameState(gameState);
    }

    private GameState newGame(int width, int height, String id) {
        GameState gameState = new GameState(width, height, id);
        return initGameState(gameState);
    }

    private GameState newGame(int width, int height) {
        GameState gameState = new GameState(width, height);
        return initGameState(gameState);
    }

    private GameState initGameState(GameState gameState) {
        int size = gameState.getWidth() * gameState.getHeight();
        gameState.setSnakeDiesCallback(x -> updateHighscore(x, size));

        String gameId = gameState.getId();

        if(gameStateMap.containsKey(gameId)) {
            throw new InvalidMapException("This id '" + gameState.getId() + "' already exists!");
        }
        gameStateMap.put(gameId, gameState);

        return gameState;
    }

    @Scheduled(fixedRate = 300)
    void periodicUpdate() {
        ArrayList<String> abandoned = new ArrayList<>();

        for (String id : allIds()) {
            GameState gameState = gameStateMap.get(id);
            if(gameState.isAbandoned()) {
                // can we remove the keys here directly? do we iterate over a copy of the key set?
                // better be safe and remove them after the iteration, in case it is
                // a reference, like apparently everything in Java
                abandoned.add(id);
                continue;
            }
            if(!gameState.isPaused() && !gameState.isGameOver()) {
                gameState.update();
                webSocketService.update(gameState);
            }
        }

        // now delete the abandoned instances
        for(String id : abandoned) {
            gameStateMap.remove(id);
        }
    }

    private void updateHighscore(Snake snake, int size) {
        var score = snake.getLength();

        // do not save highscore for AI snakes
        // also do not save very low scores
        if (snake.ai().isPresent() || score < 5) {
            return;
        }

        Date date = new Date();
        Highscore highscore = new Highscore(score, snake.getName(), size, date);
        highscoreRepository.save(highscore);
        webSocketService.updateHighscore(size);
        webSocketService.updateGlobalHighscore();
    }

    GameState idToGame(String id) {
        if(!gameStateMap.containsKey(id)) {
            throw new InvalidMapException(id);
        }

        return gameStateMap.get(id);
    }

    void close(String id) {
        gameStateMap.remove(id);
    }

    private void registerPlayer(PlayerId playerId, PlayerInfo playerInfo) {
        playerInfoMap.put(playerId, playerInfo);
    }

    private SnakeId playerToSnake(PlayerId playerId) {
        if(!playerInfoMap.containsKey(playerId)) {
            throw new InvalidMapException("PlayerId: " + playerId.getId());
        }

        return playerInfoMap.get(playerId).getSnakeId();
    }

    public Set<String> allIds() {
        return gameStateMap.keySet();
    }

    public void pause(PlayerId playerId) {
        SnakeId snakeId = playerToSnake(playerId);
        GameState state = idToGame(snakeId.getId());
        state.setPause(true);
        webSocketService.update(state);
    }

    public void unpause(PlayerId playerId) {
        SnakeId snakeId = playerToSnake(playerId);
        GameState state = idToGame(snakeId.getId());
        state.setPause(false);
        webSocketService.update(state);
    }

    public void reset(PlayerId playerId) {
        SnakeId snakeId = playerToSnake(playerId);
        GameState state = idToGame(snakeId.getId());
        state.reset();
        webSocketService.update(state);
    }

    public PlayerId joinNewGame(String sessionId, String id, int width, int height) {
        newGame(width, height, id);

        return join(sessionId, id);
    }

    public PlayerId join(String sessionId, String id) {
        // if the id does not exist, make it exist
        if(!gameStateMap.containsKey(id)) {
            newGame(20, 20, id);
        }

        SnakeId snakeId = idToGame(id).addSnake();
        PlayerId playerId = new PlayerId(IdGenerator.gen(random));
        PlayerInfo playerInfo = new PlayerInfo(playerId, snakeId, sessionId);
        registerPlayer(playerId, playerInfo);
        GameState state = idToGame(id);

        webSocketService.update(state);
        webSocketService.updateHighscore(state.getWidth()*state.getHeight());
        webSocketService.updateGlobalHighscore();
        webSocketService.notifyJoined(playerInfo);

        return playerId;
    }

    public void move(PlayerId playerId, Move move) {
        SnakeId snakeId = playerToSnake(playerId);
        idToGame(snakeId.getId()).turn(snakeId, move);
    }

    public void setName(PlayerId playerId, String name) {
        SnakeId snakeId = playerToSnake(playerId);
        GameState state = idToGame(snakeId.getId());
        state.changeName(snakeId, name);

        webSocketService.update(state);
    }

    public void addAI(PlayerId playerId, String key) {
        SnakeId snakeId = playerToSnake(playerId);
        GameState state = idToGame(snakeId.getId());

        Autopilot autopilot = new AutopilotFactory().build(key);

        state.addAISnake(autopilot);

        webSocketService.update(state);
    }

    public static Map<String, AutopilotDescription> aiDescriptions() {
        return new AutopilotFactory().getAutopilots();
    }

    public List<AutopilotDescription> listAi() {
        return new ArrayList<>(aiDescriptionMap.values());
    }

    public Optional<PlayerInfo> findPlayerBySession(String sessionId) {
        return playerInfoMap.values().stream().filter(info -> info.getSessionId().equals(sessionId)).findFirst();
    }
}
