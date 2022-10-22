package me.schawe.multijsnake.gamemanagement.player;

public record PlayerId(String id) {

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

}
