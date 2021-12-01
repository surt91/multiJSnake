package me.schawe.multijsnake.gamemanagement;

import me.schawe.multijsnake.gamemanagement.player.PlayerId;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.ai.AutopilotDescription;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class GameController {
    private final GameService map;

    GameController(GameService map) {
        this.map = map;
    }

    @PostMapping("/api/close/{id}")
    ResponseEntity<?> init(@PathVariable String id) {
        map.close(id);
        return ResponseEntity.ok("");
    }

    @GetMapping("/api/listAi")
    List<AutopilotDescription> listAi() {
        return map.listAi();
    }

    @MessageMapping("/joinNewGame/{id}/{width}/{height}")
    PlayerId joinNewGame(@Header("simpSessionId") String sessionId, @DestinationVariable String id, @DestinationVariable int width, @DestinationVariable int height) {
        return map.joinNewGame(sessionId, id, width, height);
    }

    @MessageMapping("/join/{id}")
    PlayerId join(@Header("simpSessionId") String sessionId, @DestinationVariable String id) {
        return map.join(sessionId, id);
    }

    @MessageMapping("/pause/{playerIdString}")
    void pause(@DestinationVariable String playerIdString) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.pause(playerId);
    }

    @MessageMapping("/unpause/{playerIdString}")
    void unpause(@DestinationVariable String playerIdString) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.unpause(playerId);
    }

    @MessageMapping("/reset/{playerIdString}")
    void reset(@DestinationVariable String playerIdString) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.reset(playerId);
    }

    @MessageMapping("/move/{playerIdString}")
    void move(@DestinationVariable String playerIdString, Move move) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.move(playerId, move);
    }

    @MessageMapping("/setName/{playerIdString}")
    void setName(@DestinationVariable String playerIdString, String name) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.setName(playerId, name);
    }

    @MessageMapping("/addAI/{playerIdString}")
    void addAI(@DestinationVariable String playerIdString, String type) {
        PlayerId playerId = new PlayerId(playerIdString);
        map.addAI(playerId, type);
    }
}
