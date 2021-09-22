package me.schawe.RestfulSnake;

import java.util.ArrayDeque;

public class Snake {
    Coordinate head;
    Move head_direction;
    ArrayDeque<Coordinate> tail;
    int length;
    boolean dead;

    public Coordinate getHead() {
        return head;
    }

    public Move getHead_direction() {
        return head_direction;
    }

    public boolean isDead() {
        return dead;
    }

    public int getLength() {
        return length;
    }

    public ArrayDeque<Coordinate> getTail() {
        return tail;
    }

    Snake(){
        head_direction = Move.up;
        head = new Coordinate(4, 4);
        tail = new ArrayDeque<>();
        tail.add(new Coordinate(4, 6));
        tail.add(new Coordinate(4, 5));
        length = 2;
        dead = false;
    }
}
