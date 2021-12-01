package me.schawe.multijsnake.gamemanagement.player;

import java.util.Objects;

public class PlayerId {
    private final String id;

    public PlayerId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return "PlayerId{" +
                "id='" + id + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlayerId playerId = (PlayerId) o;
        return id.equals(playerId.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
