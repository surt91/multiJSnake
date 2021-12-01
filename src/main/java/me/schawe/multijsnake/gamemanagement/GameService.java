package me.schawe.multijsnake.gamemanagement;

import me.schawe.multijsnake.gamemanagement.exceptions.InvalidMapException;
import me.schawe.multijsnake.gamemanagement.player.PlayerId;
import me.schawe.multijsnake.gamemanagement.player.PlayerInfo;
import me.schawe.multijsnake.gamemanagement.websocket.WebSocketService;
import me.schawe.multijsnake.snake.*;
import me.schawe.multijsnake.snake.ai.*;
import me.schawe.multijsnake.util.IdGenerator;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@EnableScheduling
public class GameService {
    private final WebSocketService webSocketService;
    private final ApplicationEventPublisher applicationEventPublisher;

    private final ConcurrentHashMap<String, GameState> gameStateMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<PlayerId, PlayerInfo> playerInfoMap = new ConcurrentHashMap<>();

    private final Map<String, AutopilotDescription> aiDescriptionMap;

    private final Random random;

    public GameService(WebSocketService webSocketService, ApplicationEventPublisher applicationEventPublisher) {
        this.webSocketService = webSocketService;
        this.applicationEventPublisher = applicationEventPublisher;

        this.aiDescriptionMap = aiDescriptions();

        random = new Random();
    }

    private GameState newGame(int width, int height, String id) {
        GameState gameState = new GameState(width, height, id);
        return initGameState(gameState);
    }

    private GameState initGameState(GameState gameState) {
        int size = gameState.getWidth() * gameState.getHeight();
        gameState.setSnakeDiesCallback(x -> snakeDied(x, size));

        String gameId = gameState.getId();

        if(gameStateMap.containsKey(gameId)) {
            throw new InvalidMapException("This id '" + gameState.getId() + "' already exists!");
        }
        gameStateMap.put(gameId, gameState);

        return gameState;
    }

    @Scheduled(fixedRate = 300)
    private void periodicUpdate() {
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

    // TODO: this event should be thrown by `GameState`, but it is currently not part of the DI mechanism
    // TODO: I would need to declare `GameState` a Component/Bean with Prototype scope
    // TODO: and in turn can not instantiate myself (in tests, and especially in Python)
    // TODO: Therefore, I have to refactor the `GameState` and also this class to implement this properly
    private void snakeDied(Snake snake, int size) {
        SnakeDiesEvent snakeDiesEvent = new SnakeDiesEvent(this, snake, size);
        applicationEventPublisher.publishEvent(snakeDiesEvent);
    }

    public GameState idToGame(String id) {
        if(!gameStateMap.containsKey(id)) {
            throw new InvalidMapException(id);
        }

        return gameStateMap.get(id);
    }

    public void close(String id) {
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
        String name = idToGame(id).getSnake(snakeId).getName();
        PlayerId playerId = new PlayerId(IdGenerator.gen(random));
        PlayerInfo playerInfo = new PlayerInfo(playerId, snakeId, sessionId, name);
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
