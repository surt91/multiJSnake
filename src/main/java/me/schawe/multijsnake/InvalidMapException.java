package me.schawe.multijsnake;

public class InvalidMapException extends RuntimeException {
    public InvalidMapException(String id) {
        super("is not a valid id: " + id);
    }
}
