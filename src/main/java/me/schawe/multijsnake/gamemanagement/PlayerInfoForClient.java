package me.schawe.multijsnake.gamemanagement;

public class PlayerInfoForClient {
    private final String playerId;
    private final String gameId;
    private final int idx;

    PlayerInfoForClient(PlayerInfo playerInfo) {
        this.playerId = playerInfo.getPlayerId().getId();
        this.gameId = playerInfo.getGameId();
        this.idx = playerInfo.getSnakeId().getIdx();
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
}