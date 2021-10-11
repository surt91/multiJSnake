package me.schawe.multijsnake.snake;

public class PythonEntry {

    private GameState gameState;

    public PythonEntry() {
        gameState = new GameState(10, 10);
    }

    public GameState getGameState() {
        return gameState;
    }
}