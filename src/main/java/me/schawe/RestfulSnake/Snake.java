package me.schawe.RestfulSnake;

import java.util.ArrayDeque;
import java.util.Queue;
import java.util.Random;

public class Snake {
    String id;
    int width;
    int height;
    Coordinate head;
    Move head_direction;
    Queue<Coordinate> tail;
    int length;
    Coordinate food;
    boolean dead;

    Snake() {
        id = gen_id();
        width = 10;
        height = 10;
        head_direction = Move.up;
        head = new Coordinate(4, 4);
        tail = new ArrayDeque<>();
        tail.add(new Coordinate(4, 5));
        tail.add(new Coordinate(4, 6));
        length = 3;
        dead = false;
        add_food();
    }

    public String getId() {
        return id;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public Coordinate getHead() {
        return head;
    }

    public Coordinate getFood() {
        return food;
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

    public Queue<Coordinate> getTail() {
        return tail;
    }

    public String gen_id() {
        // https://www.baeldung.com/java-random-string
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;
        Random random = new Random();

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    public void add_food() {
        do {
            food = new Coordinate((int) (Math.random() * width), (int) (Math.random() * height));
        } while (tail.contains(food) || head.equals(food));
    }

    public void update(Move move) {
        if(dead) {
            return;
        }

        // TODO: ensure that we can not switch directly to the opposite direction
        Coordinate offset = new Coordinate(0, 0);
        switch(move) {
            case up:
                if(head_direction != Move.down) {
                    offset.y = -1;
                }
                break;
            case down:
                if(head_direction != Move.up) {
                    offset.y = 1;
                }
                break;
            case left:
                if(head_direction != Move.right) {
                    offset.x = -1;
                }
                break;
            case right:
                if(head_direction != Move.left) {
                    offset.x = 1;
                }
                break;
            default:
                throw new InvalidMoveException();
        }

        head_direction = move;
        tail.add(head.copy());
        head.add(offset);

        for(Coordinate i : tail) {
            if (i.equals(head)) {
                dead = true;
            }
        }

        if(head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
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

