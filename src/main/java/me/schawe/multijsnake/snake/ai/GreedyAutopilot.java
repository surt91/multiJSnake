package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;

import java.util.List;
import java.util.Optional;
import java.util.Random;

public class GreedyAutopilot implements Autopilot {
    private enum Strategy {
        horizontal,
        vertical,
        diagonal;

        public static Strategy random() {
            double r = 3. * Math.random();
            if(r < 1) {
                return Strategy.horizontal;
            } else if (r < 2) {
                return Strategy.vertical;
            } else if (r < 3) {
                return Strategy.diagonal;
            }
            // this will not happen
            return Strategy.diagonal;
        }
    }

    private final Random random;
    private final Strategy strategy;

    public GreedyAutopilot() {
        random = new Random();
        strategy = Strategy.random();
    }

    private Optional<Move> horizontalDirection(int sourceX, int targetX) {
        if (sourceX < targetX)
            return Optional.of(Move.right);
        else if (sourceX > targetX)
            return Optional.of(Move.left);
        else
            return Optional.empty();
    }

    private Optional<Move> verticalDirection(int sourceY, int targetY) {
        if (sourceY < targetY)
            return Optional.of(Move.down);
        else if (sourceY > targetY)
            return Optional.of(Move.up);
        else
            return Optional.empty();
    }

    private Move shortestWay(GameState gameState, Snake snake) {
        switch (strategy) {
            case horizontal:
                return horizontalDirection(snake.getHead().getX(), gameState.getFood().getX())
                        .orElse(
                                verticalDirection(snake.getHead().getY(), gameState.getFood().getY())
                                        .orElse(snake.getHeadDirection())
                        );
            case vertical:
                return verticalDirection(snake.getHead().getY(), gameState.getFood().getY())
                        .orElse(
                                horizontalDirection(snake.getHead().getX(), gameState.getFood().getX())
                                        .orElse(snake.getHeadDirection())
                        );
            case diagonal:
                if (Math.abs(snake.getHead().getY() - gameState.getFood().getY()) > Math.abs(snake.getHead().getX() - gameState.getFood().getX())) {
                    return verticalDirection(snake.getHead().getY(), gameState.getFood().getY()).orElse(snake.getHeadDirection());
                } else {
                    return horizontalDirection(snake.getHead().getX(), gameState.getFood().getX()).orElse(snake.getHeadDirection());
                }
        }
        // this will not happen
        throw new RuntimeException("unreachable!");
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        Move bestMove = shortestWay(gameState, snake);
        if(isSafeMove(gameState, snake, bestMove)) {
            return bestMove;
        } else {
            List<Move> moves = possibleMoves(gameState, snake);
            if (moves.size() <= 0) {
                return snake.getHeadDirection();
            }
            int r = random.nextInt(moves.size());
            return moves.get(r);
        }
    }

    @Override
    public String generateName() {
         String[] names = {
                 "Rhombus", "Trapezoid", "Trapezium", "Hexagon", "Pentagon", "Octagon",
                 "Heptagon", "Nonagon", "Decagon", "Octahedron", "Dodecahedron", "Icosahedron",
                 "Oloid", "Sphericon", "Hyperboloid", "Isochrone", "Horopter", "Syntractrix",
                 "Trochoid", "Nephroid"
        };

        int r = random.nextInt(names.length);
        return names[r];
    }
}
