package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.snake.ai.Autopilot;

import java.util.*;

public class Snake {
    private Coordinate head;
    private Move headDirection;
    private Move lastHeadDirection;
    private ArrayDeque<Coordinate> tail;
    private int length;
    private final SnakeId id;
    private boolean dead;
    private String name;
    private final Optional<Autopilot> autopilotOptional;

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

    public SnakeId getId() {
        return id;
    }

    public int getIdx() {
        return id.getIdx();
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

    public List<Coordinate> getTailAsList() {
        return new ArrayList<>(getTail());
    }

    Snake(SnakeId id, Coordinate start, Move direction, Optional<Autopilot> autopilot) {
        lastHeadDirection = direction;
        headDirection = direction;
        head = start;
        tail = new ArrayDeque<>();
        length = 2;
        this.id = id;
        dead = false;
        if(autopilot.isPresent()) {
            name = autopilot.get().generateName();
        } else {
            name = "Anon " + (id.getIdx() + 1);
        }
        autopilotOptional = autopilot;
    }

    Snake(SnakeId id, Coordinate start){
        this(id, start, new Random());
    }

    Snake(SnakeId id, Coordinate start, Move dir){
        this(id, start, dir, Optional.empty());
    }

    Snake(SnakeId id, Coordinate start, Random random){
        this(id, start, Move.random(random), Optional.empty());
    }

    Snake(SnakeId id, Coordinate start, Random random, Autopilot autopilot){
        this(id, start, Move.random(random), Optional.of(autopilot));
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

    public void incrementLength() {
        this.length += 1;
    }

    public void setHead(Coordinate head) {
        this.head = head;
    }

    public void setHeadDirection(Move headDirection) {
        this.headDirection = headDirection;
    }

    public void setLastHeadDirection(Move lastHeadDirection) {
        this.lastHeadDirection = lastHeadDirection;
    }

    public void turnRelative(MoveRelative rmove) {
        if(this.isDead()) {
            return;
        }

        headDirection = rmove.toMove(this.getLastHeadDirection());
    }

    public void turnAbsolute(Move direction) {
        if(this.isDead()) {
            return;
        }

        headDirection = direction;
    }
}
