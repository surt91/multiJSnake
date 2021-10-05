package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.snake.ai.Autopilot;

import java.util.ArrayDeque;
import java.util.Optional;

public class Snake {
    public Coordinate head;
    public Move headDirection;
    public Move lastHeadDirection;
    ArrayDeque<Coordinate> tail;
    int length;
    int idx;
    private boolean dead;
    String name;
    private Optional<Autopilot> autopilotOptional;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
        name = "Anon " + (idx + 1);
        autopilotOptional = Optional.empty();
    }

    public void reset(Coordinate start) {
        Move dir = Move.random();
        lastHeadDirection = dir;
        headDirection = dir;
        head = start;
        tail = new ArrayDeque<>();
        length = 2;
        dead = false;
    }

    public void kill() {
        dead = true;
    }

    public Optional<Autopilot> ai() {
        return autopilotOptional;
    }

    public void setAutopilot(Autopilot autopilot) {
        this.name = autopilot.generateName();
        this.autopilotOptional = Optional.of(autopilot);
    }
}
