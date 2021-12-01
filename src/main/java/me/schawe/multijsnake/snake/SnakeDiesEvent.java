package me.schawe.multijsnake.snake;

import org.springframework.context.ApplicationEvent;

public class SnakeDiesEvent extends ApplicationEvent {
    private final Snake snake;
    private final int size;

    public SnakeDiesEvent(Object source, Snake snake, int size) {
        super(source);
        this.snake = snake;
        this.size = size;
    }

    public Snake getSnake() {
        return snake;
    }

    public int getSize() {
        return size;
   }
}

