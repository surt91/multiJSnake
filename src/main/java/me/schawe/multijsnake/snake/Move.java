package me.schawe.multijsnake.snake;

import java.util.Optional;
import java.util.Random;

public enum Move {
    left,
    right,
    up,
    down;

    public boolean isOpposite(Move other) {
        return this == left && other == right
                || this == right && other == left
                || this == up && other == down
                || this == down && other == up;
    }

    public Optional<Move> toNext(Move previous) {
        // do not turn by 180 degree
        Move next = this;
        if(isOpposite(previous)) {
            return Optional.empty();
        }

        return Optional.of(next);
    }

    public Coordinate toCoord() {
        return switch (this) {
            case up -> new Coordinate(0, -1);
            case down -> new Coordinate(0, 1);
            case left -> new Coordinate(-1, 0);
            case right -> new Coordinate(1, 0);
        };
    }

    public static Move random(Random rand) {
        double r = 4. * rand.nextFloat();
        if(r < 1) {
            return Move.up;
        } else if (r < 2) {
            return Move.down;
        } else if (r < 3) {
            return Move.left;
        } else if (r < 4) {
            return Move.right;
        }
        // this will not happen
        throw new RuntimeException("unreachable!");
    }

    public static Move random() {
        return random(new Random());
    }

    public Move rLeft() {
        return switch (this) {
            case up -> Move.left;
            case down -> Move.right;
            case left -> Move.down;
            case right -> Move.up;
        };
    }

    public Move rRight() {
        return switch (this) {
            case up -> Move.right;
            case down -> Move.left;
            case left -> Move.up;
            case right -> Move.down;
        };
    }

    public Move straight() {
        return this;
    }

    public Move back() {
        return switch (this) {
            case up -> Move.down;
            case down -> Move.up;
            case left -> Move.right;
            case right -> Move.left;
        };
    }
}
