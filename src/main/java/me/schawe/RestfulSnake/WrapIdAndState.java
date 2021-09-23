package me.schawe.RestfulSnake;

public class WrapIdAndState {
    private int snakeId;
    private GameState state;

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
