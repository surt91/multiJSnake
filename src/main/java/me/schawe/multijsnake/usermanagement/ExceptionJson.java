package me.schawe.multijsnake.usermanagement;

public class ExceptionJson {
    private final String error;

    public ExceptionJson(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
