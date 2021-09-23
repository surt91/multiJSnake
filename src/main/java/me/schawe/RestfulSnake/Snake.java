package me.schawe.RestfulSnake;

import java.util.ArrayDeque;

public class Snake {
    Coordinate head;
    Move headDirection;
    Move lastHeadDirection;
    ArrayDeque<Coordinate> tail;
    int length;
    int idx;
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

    public int getIdx() {
        return idx;
    }

    public ArrayDeque<Coordinate> getTail() {
        return tail;
    }

    Snake(int idx, Coordinate start){
        Move dir = Move.random();
        lastHeadDirection = dir;
        headDirection = dir;
        head = start;
        tail = new ArrayDeque<>();
        length = 2;
        this.idx = idx;
        dead = false;
    }
}
