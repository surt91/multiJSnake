package me.schawe.RestfulSnake;

public class ExceptionJson {
    String error;

    public ExceptionJson(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
}
