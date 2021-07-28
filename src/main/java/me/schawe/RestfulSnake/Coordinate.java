package me.schawe.RestfulSnake;

public class Coordinate {
    int x;
    int y;

    public Coordinate(int xi, int yi) {
        x = xi;
        y = yi;
    }

    public void add(Coordinate other){
        this.x += other.x;
        this.y += other.y;
    }

    public boolean equals(Coordinate other) {
        return this.x == other.x && this.y == other.y;
    }
}
