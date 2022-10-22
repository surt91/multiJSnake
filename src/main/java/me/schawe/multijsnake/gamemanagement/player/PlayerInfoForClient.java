package me.schawe.multijsnake.gamemanagement.player;

public class PlayerInfoForClient {
    private final String playerId;
    private final String gameId;
    private final int idx;
    private final String name;

    public PlayerInfoForClient(PlayerInfo playerInfo) {
        this.playerId = playerInfo.playerId().id();
        this.gameId = playerInfo.getGameId();
        this.idx = playerInfo.snakeId().getIdx();
        this.name = playerInfo.name();
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getGameId() {
        return gameId;
    }

    public int getIdx() {
        return idx;
    }

    public String getName() {
        return name;
    }
}