package me.schawe.RestfulSnake;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class InvalidMoveAdvice {

    @ResponseBody
    @ExceptionHandler(InvalidMoveException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    String invalidMoveHandler(InvalidMoveException ex) {
        return ex.getMessage();
    }
}