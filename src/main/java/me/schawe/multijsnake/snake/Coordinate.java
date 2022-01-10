package me.schawe.multijsnake.snake;

import java.util.Objects;

public class Coordinate {
    private final int x;
    private final int y;

    public int getX() {
        return x;
    }

    public int getY() {
        return y;
    }

    public Coordinate(int xi, int yi) {
        x = xi;
        y = yi;
    }

    public Coordinate copy() {
        return new Coordinate(x, y);
    }

    public Coordinate add(Coordinate other){
        return new Coordinate(
            this.x + other.x,
            this.y + other.y
        );
    }

    @Override
    public String toString() {
        return "Coordinate{" +
                "x=" + x +
                ", y=" + y +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Coordinate that = (Coordinate) o;
        return x == that.x && y == that.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
