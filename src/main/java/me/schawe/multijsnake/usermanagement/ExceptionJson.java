package me.schawe.multijsnake.usermanagement;

public class ExceptionJson {
    String error;

    public ExceptionJson(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
