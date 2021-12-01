package me.schawe.multijsnake.gamemanagement.exceptions;

public class InvalidMapException extends RuntimeException {
    public InvalidMapException(String id) {
        super("is not a valid id: " + id);
    }
}
