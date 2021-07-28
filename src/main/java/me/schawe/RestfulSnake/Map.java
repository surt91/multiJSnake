package me.schawe.RestfulSnake;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Queue;
import java.util.Set;

public class Map {
    int width;
    int height;
    Coordinate head;
    Move head_direction;
    Queue<Coordinate> tail;
    int length;
    Coordinate food;
    boolean dead;

    public Map() {
        width = 10;
        height = 10;
        head_direction = Move.up;
        head = new Coordinate(4, 4);
        tail = new ArrayDeque<>();
        tail.add(new Coordinate(4, 3));
        tail.add(new Coordinate(4, 2));
        length = 3;
        dead = false;
        add_food();
    }

    public void add_food() {
        do {
            food = new Coordinate((int) (Math.random() * width), (int) (Math.random() * height));
        } while (tail.contains(food) || head.equals(food));
    }

    public void update(Move move) throws InvalidMoveException {
        Coordinate offset;
        switch(move) {
            case up:
                offset = new Coordinate(0, 1);
                break;
            case down:
                offset = new Coordinate(0, -1);
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

        head_direction = move;
        tail.add(head);
        head.add(offset);

        if(tail.contains(head)) {
            dead = true;
        }

        if(head.equals(food)) {
            length += 1;
            add_food();
        }

        while(tail.size() >= length + 1) {
            tail.remove();
        }
    }
}

