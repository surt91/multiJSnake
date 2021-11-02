package me.schawe.multijsnake.gamemanagement;

import me.schawe.multijsnake.snake.SnakeId;

public class PlayerInfo {
    private final PlayerId playerId;
    private final String sessionId;
//    private final GameId gameId;
    private final SnakeId snakeId;

    PlayerInfo(PlayerId playerId, SnakeId snakeId, String sessionId) {
        this.playerId = playerId;
        this.snakeId = snakeId;
        this.sessionId = sessionId;
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

    @Override
    public String toString() {
        return "PlayerInfo{" +
                "playerId=" + playerId +
                ", sessionId='" + sessionId + '\'' +
                ", snakeId=" + snakeId +
                '}';
    }
}