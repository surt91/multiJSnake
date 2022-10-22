package me.schawe.multijsnake.gamemanagement.player;

import me.schawe.multijsnake.snake.SnakeId;

public record PlayerInfo(PlayerId playerId, SnakeId snakeId, String sessionId, String name) {

    public String getGameId() {
        return snakeId.getId();
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