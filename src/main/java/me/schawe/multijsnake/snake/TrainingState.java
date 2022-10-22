package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.snake.exceptions.InvalidMoveException;

import java.util.ArrayList;
import java.util.List;

public class TrainingState {
    private final GameState gameState;

    public TrainingState(GameState gameState) {
        this.gameState = gameState;
    }

    private int danger(Coordinate c) {
        if(gameState.isOccupied(c) || gameState.isWall(c)) {
            return 1;
        }
        return 0;
    }

    /// get the state of the game
    /// here we just take up to third nearest neighbor fields of the snake's head
    /// 1: snake/wall
    /// 0: free
    /// and in which direction the food is
    /// 0/1: it's in front
    /// 0/1: it's left
    /// 0/1: it's right
    public List<Integer> vector(SnakeId snakeId) {
        Snake snake = gameState.getSnake(snakeId);
        ArrayList<Integer> state = new ArrayList<>();

        double rad = Geometry.angle(snake.getHead(), snake.getHeadDirection(), gameState.getFood());
        double eps = 1e-6;

        // is food in front?
        if (Math.abs(rad) < Math.PI / 2 - eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        // is food left?
        if (rad > eps && rad < Math.PI - eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        // is food right?
        if (rad < -eps && rad > -Math.PI + eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        // is food behind?
        if (Math.abs(rad) > Math.PI/2. + eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        Coordinate straight = snake.getHeadDirection().toCoord();
        Coordinate left = snake.getHeadDirection().rLeft().toCoord();
        Coordinate right = snake.getHeadDirection().rRight().toCoord();
        Coordinate back = snake.getHeadDirection().back().toCoord();

        // first neighbors
        state.add(danger(snake.getHead().add(left)));
        state.add(danger(snake.getHead().add(straight)));
        state.add(danger(snake.getHead().add(right)));
        // omit back, its always occupied

        // second neighbors
        state.add(danger(snake.getHead().add(back).add(left)));
        state.add(danger(snake.getHead().add(left).add(straight)));
        state.add(danger(snake.getHead().add(straight).add(right)));
        state.add(danger(snake.getHead().add(right).add(back)));

        // third neighbors
        state.add(danger(snake.getHead().add(left).add(left)));
        state.add(danger(snake.getHead().add(straight).add(straight)));
        state.add(danger(snake.getHead().add(right).add(right)));
        state.add(danger(snake.getHead().add(back).add(back)));

        return state;
    }

    /// get the state of the game
    /// here we take bitmap of the field with multiple layers:
    /// first layer: 1: food, else 0
    /// second layer: 1: head of the current snake, else 0
    /// third layer: number of turns the site will be occupied by the tail of a snake
    /// this is inspired by https://towardsdatascience.com/learning-to-play-snake-at-1-million-fps-4aae8d36d2f1
    public int[][][] bitmap(SnakeId snakeId) {
        Snake snake = gameState.getSnake(snakeId);
        // this is initialized to 0 https://stackoverflow.com/a/2154340
        int[][][] state = new int[gameState.getWidth()][gameState.getHeight()][3];

        state[gameState.getFood().getX()][gameState.getFood().getY()][0] = 1;
        // the head can be outside the field (after collision with a wall)
        if(!gameState.isWall(snake.getHead())) {
            state[snake.getHead().getX()][snake.getHead().getY()][1] = 1;
        }

        for(Snake s : gameState.getSnakeSet()) {
            int ctr = 1;
            for(Coordinate site : s.getTail()) {
                state[site.getX()][site.getY()][2] = ctr;
                ctr += 1;
            }
            if(!gameState.isWall(s.getHead())) {
                state[s.getHead().getX()][s.getHead().getY()][2] = ctr;
            }
        }

        // your own getHead() is ok ... this is probably not necessary ...
        if(!gameState.isWall(snake.getHead())) {
            state[snake.getHead().getX()][snake.getHead().getY()][2] = 0;
        }

        return state;
    }

    public static Move relativeAction2Move(int action, Move lastHeadDirection) {
        return switch (action) {
            case 0 -> lastHeadDirection.rLeft();
            case 1 -> lastHeadDirection.straight();
            case 2 -> lastHeadDirection.rRight();
            default -> throw new InvalidMoveException("invalid relative direction: " + action);
        };
    }

    public static Move absoluteAction2Move(int action) {
        return switch (action) {
            case 0 -> Move.up;
            case 1 -> Move.right;
            case 2 -> Move.down;
            case 3 -> Move.left;
            default -> throw new InvalidMoveException("invalid absolute direction: " + action);
        };
    }
}
