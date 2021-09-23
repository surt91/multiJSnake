package me.schawe.RestfulSnake;

import java.lang.annotation.Retention;
import java.util.Optional;

public enum Move {
    left,
    right,
    up,
    down;

    public boolean isOpposite(Move other) {
        if(this==left && other == right) {
            return true;
        }
        if(this==right && other == left) {
            return true;
        }
        if(this==up && other == down) {
            return true;
        }
        if(this==down && other == up) {
            return true;
        }
        return false;
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
        Coordinate offset;
        switch(this) {
            case up:
                offset = new Coordinate(0, -1);
                break;
            case down:
                offset = new Coordinate(0, 1);
                break;
            case left:
                offset = new Coordinate(-1, 0);
                break;
            case right:
                offset = new Coordinate(1, 0);
                break;
            default:
                throw new InvalidMoveException();
        }
        return offset;
    }
}
