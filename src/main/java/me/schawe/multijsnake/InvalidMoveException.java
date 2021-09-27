package me.schawe.multijsnake;

public class InvalidMoveException extends RuntimeException {
    public InvalidMoveException() {
        super("is not a valid move");
    }
}
