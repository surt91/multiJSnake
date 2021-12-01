package me.schawe.multijsnake.gamemanagement.player;

import me.schawe.multijsnake.snake.SnakeId;

public class PlayerInfo {
    private final PlayerId playerId;
    private final String sessionId;
    private final SnakeId snakeId;
    private final String name;

    public PlayerInfo(PlayerId playerId, SnakeId snakeId, String sessionId, String name) {
        this.playerId = playerId;
        this.snakeId = snakeId;
        this.sessionId = sessionId;
        this.name = name;
    }

    public String getSessionId() {
        return sessionId;
    }

    public SnakeId getSnakeId() {
        return snakeId;
    }

    public String getGameId() {
        return snakeId.getId();
    }

    public PlayerId getPlayerId() {
        return playerId;
    }

    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "PlayerInfo{" +
                "playerId=" + playerId +
                ", sessionId='" + sessionId + '\'' +
                ", snakeId=" + snakeId +
                ", name='" + name + '\'' +
                '}';
    }
}