package me.schawe.RestfulSnake;

public class InvalidMoveException extends RuntimeException {
    public InvalidMoveException() {
        super("is not a valid move");
    }
}
