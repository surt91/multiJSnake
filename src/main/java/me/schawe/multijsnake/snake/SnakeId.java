package me.schawe.multijsnake.snake;

import java.util.Objects;

public class SnakeId {
    private final String id;
    private final int idx;

    public SnakeId(String id, int idx) {
        this.id = id;
        this.idx = idx;
    }

    public String getId() {
        return id;
    }

    public int getIdx() {
        return idx;
    }

    @Override
    public String toString() {
        return "SnakeId{" +
                "id='" + id + '\'' +
                ", idx=" + idx +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SnakeId snakeId = (SnakeId) o;
        return idx == snakeId.idx && id.equals(snakeId.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, idx);
    }
}
