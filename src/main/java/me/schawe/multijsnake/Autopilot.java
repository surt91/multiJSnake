package me.schawe.multijsnake;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

// https://github.com/surt91/rsnake
public interface Autopilot {
    Move suggest(GameState gameState, Snake snake);

    default List<Move> possibleMoves(GameState gameState, Snake snake) {
        Move[] allMoves = {Move.up, Move.down, Move.left, Move.right};

        return Arrays.stream(allMoves)
                .filter(move -> !move.isOpposite(snake.headDirection))
                .filter(move -> !gameState.isOccupied(move.toCoord().add(snake.head)))
                .filter(move -> !gameState.isWall(move.toCoord().add(snake.head)))
                .collect(Collectors.toList());
    }

    String generateName();
}
