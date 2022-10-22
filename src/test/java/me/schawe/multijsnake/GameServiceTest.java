package me.schawe.multijsnake;

import me.schawe.multijsnake.gamemanagement.GameService;
import me.schawe.multijsnake.gamemanagement.exceptions.InvalidMapException;
import me.schawe.multijsnake.gamemanagement.player.PlayerId;
import me.schawe.multijsnake.gamemanagement.player.PlayerInfo;
import me.schawe.multijsnake.gamemanagement.websocket.WebSocketService;
import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Snake;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
public class GameServiceTest {

    @Mock
    private WebSocketService webSocketServiceMock;

    @Mock
    private ApplicationEventPublisher applicationEventPublisherMock;

    @InjectMocks
    private GameService gameService;

    @Test
    public void newGameTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        Mockito.verify(webSocketServiceMock).update(any(GameState.class));
        Mockito.verify(webSocketServiceMock).updateHighscore(w*h);
        Mockito.verify(webSocketServiceMock).updateGlobalHighscore();

        ArgumentCaptor<PlayerInfo> argumentCaptor = ArgumentCaptor.forClass(PlayerInfo.class);
        Mockito.verify(webSocketServiceMock).notifyJoined(argumentCaptor.capture());
        PlayerInfo capturedArgument = argumentCaptor.getValue();
        assertEquals(capturedArgument.getGameId(), gameId);
        assertEquals(capturedArgument.playerId(), playerId);
        assertEquals(capturedArgument.sessionId(), sessionId);
    }

    @Test
    public void newGameExistsTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        Exception exception = assertThrows(InvalidMapException.class, () ->
            gameService.joinNewGame(sessionId, gameId, w, h)
        );

        String expectedMessage = "already exists!";
        String actualMessage = exception.getMessage();

        assertTrue(actualMessage.contains(expectedMessage));
    }

    @Test
    public void pauseGameTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        ArgumentCaptor<GameState> argumentCaptor = ArgumentCaptor.forClass(GameState.class);

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        GameState state1 = gameService.idToGame(gameId);
        Mockito.verify(webSocketServiceMock).update(argumentCaptor.capture());
        GameState capturedState1 = argumentCaptor.getValue();
        assertTrue(state1.isPaused());
        assertTrue(capturedState1.isPaused());

        gameService.unpause(playerId);

        GameState capturedState2 = argumentCaptor.getValue();
        GameState state2 = gameService.idToGame(gameId);
        assertFalse(state2.isPaused());
        assertFalse(capturedState2.isPaused());

        gameService.pause(playerId);

        GameState capturedState3 = argumentCaptor.getValue();
        GameState state3 = gameService.idToGame(gameId);
        assertTrue(state3.isPaused());
        assertTrue(capturedState3.isPaused());
    }

    @Test
    public void setNameTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";
        String name = "newName";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        gameService.setName(playerId, name);
        GameState state = gameService.idToGame(gameId);
        assertTrue(state.getSnakeSet().stream().findAny().isPresent());
        Snake snake = state.getSnakeSet().stream().findAny().get();
        assertEquals(snake.getName(), name);

        Mockito.verify(webSocketServiceMock, times(2)).update(any(GameState.class));
    }

    @Test
    public void resetTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        gameService.unpause(playerId);
        GameState state1 = gameService.idToGame(gameId);
        assertFalse(state1.isPaused());

        gameService.reset(playerId);
        GameState state2 = gameService.idToGame(gameId);
        assertTrue(state2.isPaused());

        Mockito.verify(webSocketServiceMock, times(3)).update(any(GameState.class));
    }

    @Test
    public void addAiTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        gameService.addAI(playerId, "random");
        gameService.addAI(playerId, "greedy");
        gameService.addAI(playerId, "ac_100");
        gameService.addAI(playerId, "conv_ac_75000");

        Mockito.verify(webSocketServiceMock, times(5)).update(any(GameState.class));
        GameState state2 = gameService.idToGame(gameId);
        assertEquals(state2.getSnakeSet().size(), 5);
    }

    @Test
    public void periodicUpdateTest() {
        int w = 10, h = 10;
        String sessionId = "sessionId";
        String gameId = "gameId";

        PlayerId playerId = gameService.joinNewGame(sessionId, gameId, w, h);

        gameService.addAI(playerId, "random");
        gameService.addAI(playerId, "greedy");
        gameService.addAI(playerId, "ac_100");
        gameService.addAI(playerId, "conv_ac_75000");

        Mockito.verify(webSocketServiceMock, times(5)).update(any(GameState.class));
        GameState state2 = gameService.idToGame(gameId);
        assertEquals(state2.getSnakeSet().size(), 5);
    }
}
