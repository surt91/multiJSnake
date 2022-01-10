package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;

import java.util.List;
import java.util.Optional;
import java.util.Random;

public class BoringAutopilot implements Autopilot {
    private final Random random;

    public BoringAutopilot() {
        random = new Random();
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        List<Move> moves = possibleMoves(gameState, snake);
        if (snake.getHead().getY() == 0 && isSafeMove(gameState, snake, Move.left)) {
            return Move.left;
        } else if(isSafeMove(gameState, snake, Move.down)) {
            return Move.down;
        } else if (snake.getHead().getY() == 1 && isSafeMove(gameState, snake, Move.right)) {
            return Move.right;
        } else if (isSafeMove(gameState, snake, Move.up)){
            return Move.up;
        } else {
            return Move.right;
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
