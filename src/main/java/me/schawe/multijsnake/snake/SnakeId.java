package me.schawe.multijsnake.snake;

public class SnakeId {
    String id;
    int idx;

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
}
