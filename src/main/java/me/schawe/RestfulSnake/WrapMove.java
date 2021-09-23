package me.schawe.RestfulSnake;

public class WrapMove {
    private final String id;
    private final int idx;
    private final Move move;

    public WrapMove(String id, int idx, Move move) {
        this.id = id;
        this.idx = idx;
        this.move = move;
    }

    public String getId() {
        return id;
    }

    public int getIdx() {
        return idx;
    }

    public Move getMove() {
        return move;
    }
}
