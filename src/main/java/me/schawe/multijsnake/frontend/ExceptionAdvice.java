package me.schawe.multijsnake.frontend;

import me.schawe.multijsnake.gamemanagement.exceptions.InvalidMapException;
import me.schawe.multijsnake.snake.exceptions.InvalidMoveException;
import me.schawe.multijsnake.usermanagement.ExceptionJson;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class ExceptionAdvice {
    @ResponseBody
    @ExceptionHandler(InvalidMoveException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionJson invalidMoveHandler(InvalidMoveException ex) {
        return new ExceptionJson(ex.getMessage());
    }

    @ResponseBody
    @ExceptionHandler(InvalidMapException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ExceptionJson invalidMapHandler(InvalidMapException ex) {
        return new ExceptionJson(ex.getMessage());
    }
}