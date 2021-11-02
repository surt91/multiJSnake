package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.snake.ai.AutopilotFactory;
import me.schawe.multijsnake.snake.ai.GreedyAutopilot;
import me.schawe.multijsnake.snake.ai.RandomAutopilot;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Random;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.*;

class GameStateTest {

    GameState gameState;

    @BeforeEach
    void setUp() {
        // ensure a well defined state to test against
        gameState = new GameState(42, 23, 42);
    }

    @Test
    void getWidth() {
        assertEquals(
                42,
                gameState.getWidth(),
                "getWidth should work."
        );
    }

    @Test
    void getHeight() {
        assertEquals(
                23,
                gameState.getHeight(),
                "getWidth should work."
        );
    }

    @Test
    void getFood() {
        gameState.addFood(new Coordinate(30, 1));
        assertTrue(
                gameState.getFood().equals(new Coordinate(30, 1)),
                "getFood should work."
        );
    }

    @Test
    void isPaused() {
        assertTrue(
                gameState.isPaused(),
                "isPaused should work."
        );
        gameState.setPause(false);
        assertFalse(
                gameState.isPaused(),
                "isPaused should work."
        );
        gameState.setPause(true);
        assertTrue(
                gameState.isPaused(),
                "isPaused should work."
        );
    }

    @Test
    void isGameOver() {
        SnakeId id = gameState.addSnake();
        assertFalse(
                gameState.isGameOver(),
                "isGameOver should work."
        );
        gameState.kill(id);
        gameState.update();
        assertTrue(
                gameState.isGameOver(),
                "isGameOver should work."
        );
    }

    @Test
    void abandoned() {
        assertFalse(gameState.isAbandoned());
        SnakeId id = gameState.addSnake();
        gameState.created = Instant.now().minusSeconds(100);
        assertFalse(gameState.isAbandoned());
        SnakeId id1 = gameState.addAISnake(new RandomAutopilot());
        assertFalse(gameState.isAbandoned());
        gameState.markForRemoval(id);
        assertTrue(gameState.isAbandoned());
    }

    @Test
    void abandonedAfterTime() {
        assertFalse(gameState.isAbandoned());
        gameState.created = Instant.now().minusSeconds(100);
        assertTrue(gameState.isAbandoned());
    }

    @Test
    void changeName() {
        SnakeId id = gameState.addSnake();
        SnakeId id2 = gameState.addSnake();
        assertNotEquals(gameState.getSnake(id).getName(), "Test1");
        assertNotEquals(gameState.getSnake(id2).getName(), "Test1");
        gameState.changeName(id, "Test1");
        assertEquals(gameState.getSnake(id).getName(), "Test1");
        assertNotEquals(gameState.getSnake(id2).getName(), "Test1");
    }

    @Test
    void gen_id() {
        assertEquals(10, IdGenerator.gen(new Random()).length());
    }

    @Test
    void turn() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        Snake snake = gameState.getSnake(id);

        assertEquals(Move.down, snake.getHeadDirection());

        // try valid moves
        gameState.turn(id, Move.down);
        assertEquals(Move.down, snake.getHeadDirection());

        gameState.turn(id, Move.left);
        assertEquals(Move.left, snake.getHeadDirection());

        gameState.turn(id, Move.right);
        assertEquals(Move.right, snake.getHeadDirection());

        // ensure that the previous direction is kept on invalid move
        gameState.turn(id, Move.up);
        assertEquals(Move.right, snake.getHeadDirection());

        gameState.turn(id, Move.down);
        assertEquals(Move.down, snake.getHeadDirection());

        gameState.turn(id, Move.up);
        assertEquals(Move.down, snake.getHeadDirection());
    }

    @Test
    void move() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);

        assertEquals(Move.down, snake.getHeadDirection());
        assertTrue(snake.getHead().equals(new Coordinate(28, 1)));
        gameState.update();
        assertTrue(new Coordinate(28, 2).equals(new Coordinate(28, 1).add(Move.down.toCoord())));
        assertTrue(snake.getHead().equals(new Coordinate(28, 2)));
    }

    @Test
    void feed() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);
        gameState.addFood(new Coordinate(30, 1));

        assertEquals(2, snake.getLength(), "initial length");
        assertEquals(Move.down, snake.getHeadDirection(), "initial direction");
        assertTrue(snake.getHead().equals(new Coordinate(28, 1)), "initial position");
        assertTrue(gameState.getFood().equals(new Coordinate(30, 1)), "initial food position");
        gameState.turn(id, Move.right);
        gameState.update();
        gameState.update();
        assertTrue(snake.getHead().equals(new Coordinate(30, 1)), "food reached");
        gameState.update();
        assertFalse(gameState.getFood().equals(new Coordinate(30, 1)), "new food");
        assertEquals(3, snake.getLength(), "growth");
    }

    @Test
    void dieWall() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);

        assertEquals(Move.down, snake.getHeadDirection(), "initial direction");
        assertTrue(snake.getHead().equals(new Coordinate(28, 1)), "initial position");
        gameState.turn(id, Move.left);
        gameState.update();
        gameState.turn(id, Move.up);
        gameState.update();
        assertTrue(snake.getHead().equals(new Coordinate(27, 0)), "intermediate position");
        assertFalse(snake.isDead());
        gameState.update();
        assertTrue(snake.isDead());
    }

    @Test
    void dieSelf() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);
        for(int i=0; i<10; ++i) {
            snake.incrementLength();
        }

        assertEquals(Move.down, snake.getHeadDirection(), "initial direction");
        gameState.update();
        gameState.turn(id, Move.left);
        gameState.update();
        assertFalse(snake.isDead());
        gameState.turn(id, Move.up);
        gameState.update();
        assertFalse(snake.isDead());
        gameState.turn(id, Move.right);
        gameState.update();
        assertTrue(snake.isDead());
    }

    @Test
    void dieOther() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        SnakeId otherId = gameState.addSnake(new Coordinate(39, 6), Move.left);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);
        Snake other = gameState.getSnake(otherId);
        for(int i=0; i<20; ++i) {
            snake.incrementLength();
            other.incrementLength();
        }

        assertEquals(Move.down, snake.getHeadDirection(), "initial direction");
        assertEquals(Move.left, other.getHeadDirection(), "initial direction other");
        assertTrue(snake.getHead().equals(new Coordinate(28, 1)), "initial position");
        assertTrue(other.getHead().equals(new Coordinate(39, 6)), "initial position other");
        for(int i=0; i<10; ++i){
            gameState.update();
        }
        assertFalse(snake.isDead());
        assertFalse(other.isDead());
        assertTrue(other.getHead().equals(new Coordinate(29, 6)), "intermediate position other");
        gameState.update();
        assertFalse(snake.isDead());
        assertTrue(other.isDead());
    }

    @Test
    void addAi() {
        SnakeId id1 = gameState.addAISnake(new RandomAutopilot());
        SnakeId id2 = gameState.addAISnake(new GreedyAutopilot());
        assertEquals(2, gameState.getSnakeSet().size());
        gameState.setPause(false);
        gameState.update();
    }

    @Test
    void addAiFromYaml() {
        var a = new AutopilotFactory();
        for(String id : a.getAutopilots().keySet()) {
            gameState.addAISnake(a.build(id));
        }
        assertEquals(a.getAutopilots().size(), gameState.getSnakeSet().size());
        gameState.setPause(false);
        gameState.update();
    }

    @Test
    void reset() {
        SnakeId id = gameState.addSnake(new Coordinate(28, 1), Move.down);
        gameState.setPause(false);
        Snake snake = gameState.getSnake(id);

        assertEquals(Move.down, snake.getHeadDirection(), "initial direction");
        assertTrue(snake.getHead().equals(new Coordinate(28, 1)), "initial position");
        gameState.turn(id, Move.left);
        gameState.update();
        gameState.turn(id, Move.up);
        gameState.update();
        assertTrue(snake.getHead().equals(new Coordinate(27, 0)), "intermediate position");
        assertFalse(snake.isDead(), "snake alive");
        gameState.update();

        assertTrue(snake.isDead(), "snake dies");
        assertTrue(gameState.isGameOver(), "game over");

        gameState.reset();

        assertFalse(snake.isDead(), "snake lives");
        assertFalse(gameState.isGameOver(), "game running");
    }


    @Test
    void detectFood() {
        SnakeId id = gameState.addSnake(new Coordinate(5, 5), Move.down);
        Snake snake = gameState.getSnake(id);
        List<Integer> state;

        gameState.addFood(new Coordinate(9, 9));

        snake.turnAbsolute(Move.right);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 0, 1, 0));

        snake.turnAbsolute(Move.up);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 0, 1, 1));

        snake.turnAbsolute(Move.left);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 1, 0, 1));

        snake.turnAbsolute(Move.down);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 1, 0, 0));


        gameState.addFood(new Coordinate(1, 1));

        snake.turnAbsolute(Move.right);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 1, 0, 1));

        snake.turnAbsolute(Move.up);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 1, 0, 0));

        snake.turnAbsolute(Move.left);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 0, 1, 0));

        snake.turnAbsolute(Move.down);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 0, 1, 1));


        gameState.addFood(new Coordinate(9, 1));

        snake.turnAbsolute(Move.right);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 1, 0, 0));

        snake.turnAbsolute(Move.up);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 0, 1, 0));

        snake.turnAbsolute(Move.left);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 0, 1, 1));

        snake.turnAbsolute(Move.down);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 1, 0, 1));


        gameState.addFood(new Coordinate(1, 9));

        snake.turnAbsolute(Move.right);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 0, 1, 1));

        snake.turnAbsolute(Move.up);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(0, 1, 0, 1));

        snake.turnAbsolute(Move.left);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 1, 0, 0));

        snake.turnAbsolute(Move.down);
        state = new TrainingState(gameState).vector(id);
        assertThat(state.subList(0, 4), contains(1, 0, 1, 0));


        gameState.addFood(new Coordinate(5, 9));

        snake.turnAbsolute(Move.right);
        state = new TrainingState(gameState).vector(id);
        assertEquals(Geometry.angle(snake.getHead(), snake.getHeadDirection(), gameState.getFood()), -Math.PI/2);
        assertThat(state.subList(0, 4), contains(0, 0, 1, 0));

        snake.turnAbsolute(Move.up);
        state = new TrainingState(gameState).vector(id);
        assertEquals(Math.abs(Geometry.angle(snake.getHead(), snake.getHeadDirection(), gameState.getFood())), Math.PI);
        assertThat(state.subList(0, 4), contains(0, 0, 0, 1));

        snake.turnAbsolute(Move.left);
        state = new TrainingState(gameState).vector(id);
        assertEquals(Geometry.angle(snake.getHead(), snake.getHeadDirection(), gameState.getFood()), Math.PI/2);
        assertThat(state.subList(0, 4), contains(0, 1, 0, 0));

        snake.turnAbsolute(Move.down);
        state = new TrainingState(gameState).vector(id);
        assertEquals(Geometry.angle(snake.getHead(), snake.getHeadDirection(), gameState.getFood()), 0);
        assertThat(state.subList(0, 4), contains(1, 0, 0, 0));
    }
}