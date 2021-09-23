package me.schawe.RestfulSnake;

public class WrapIdAndState {
    private final int snakeId;
    private final GameState state;

    public WrapIdAndState(int snakeId, GameState state) {
        this.snakeId = snakeId;
        this.state = state;
    }

    public int getSnakeId() {
        return snakeId;
    }

    public GameState getState() {
        return state;
    }
}
