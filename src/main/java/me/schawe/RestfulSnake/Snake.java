package me.schawe.RestfulSnake;

import java.util.ArrayDeque;

public class Snake {
    Coordinate head;
    Move headDirection;
    Move lastHeadDirection;
    ArrayDeque<Coordinate> tail;
    int length;
    boolean dead;

    public Coordinate getHead() {
        return head;
    }

    public Move getHeadDirection() {
        return headDirection;
    }

    public Move getLastHeadDirection() {
        return lastHeadDirection;
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
        lastHeadDirection = Move.up;
        headDirection = Move.up;
        head = new Coordinate(4, 4);
        tail = new ArrayDeque<>();
        tail.add(new Coordinate(4, 6));
        tail.add(new Coordinate(4, 5));
        length = 2;
        dead = false;
    }
}
