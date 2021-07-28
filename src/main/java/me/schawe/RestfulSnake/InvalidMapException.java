package me.schawe.RestfulSnake;

public class InvalidMapException extends RuntimeException {
    public InvalidMapException(String id) {
        super("is not a valid id: " + id);
    }
}
