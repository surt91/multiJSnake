package me.schawe.multijsnake.snake;

public class InvalidMoveException extends RuntimeException {
    public InvalidMoveException() {
        super("is not a valid move");
    }
}
