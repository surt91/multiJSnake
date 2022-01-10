package me.schawe.multijsnake.snake;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SnakeTest {

    Snake snake;

    @BeforeEach
    void setUp() {
        SnakeId snakeId = new SnakeId("snake", 0);
        Coordinate coord = new Coordinate(1, 1);
        Move dir = Move.up;
        snake = new Snake(snakeId, coord, dir);
    }

    @Test
    void relativeTurn() {
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.left);
        assertEquals(snake.getHeadDirection(), Move.left);
        snake.turnRelative(MoveRelative.straight);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.right);
        assertEquals(snake.getHeadDirection(), Move.right);

        snake.step();
        assertEquals(snake.getHeadDirection(), Move.right);
        snake.turnRelative(MoveRelative.left);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.straight);
        assertEquals(snake.getHeadDirection(), Move.right);
        snake.turnRelative(MoveRelative.right);
        assertEquals(snake.getHeadDirection(), Move.down);

        snake.step();
        assertEquals(snake.getHeadDirection(), Move.down);
        snake.turnRelative(MoveRelative.left);
        assertEquals(snake.getHeadDirection(), Move.right);
        snake.turnRelative(MoveRelative.straight);
        assertEquals(snake.getHeadDirection(), Move.down);
        snake.turnRelative(MoveRelative.right);
        assertEquals(snake.getHeadDirection(), Move.left);

        snake.step();
        assertEquals(snake.getHeadDirection(), Move.left);
        snake.turnRelative(MoveRelative.left);
        assertEquals(snake.getHeadDirection(), Move.down);
        snake.turnRelative(MoveRelative.straight);
        assertEquals(snake.getHeadDirection(), Move.left);
        snake.turnRelative(MoveRelative.right);
        assertEquals(snake.getHeadDirection(), Move.up);
    }
    @Test
    void relativeTurnDead() {
        snake.kill();
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.left);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.straight);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnRelative(MoveRelative.right);
        assertEquals(snake.getHeadDirection(), Move.up);
    }

    @Test
    void absoluteTurn() {
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnAbsolute(Move.left);
        assertEquals(snake.getHeadDirection(), Move.left);
        snake.turnAbsolute(Move.right);
        assertEquals(snake.getHeadDirection(), Move.right);
        snake.turnAbsolute(Move.down);
        assertEquals(snake.getHeadDirection(), Move.down);
    }

    @Test
    void absoluteTurnDead() {
        snake.kill();
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnAbsolute(Move.left);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnAbsolute(Move.right);
        assertEquals(snake.getHeadDirection(), Move.up);
        snake.turnAbsolute(Move.down);
        assertEquals(snake.getHeadDirection(), Move.up);
    }
}