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
    private final Autopilot autopilot;

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

    public Snake(SnakeId id, Coordinate start, Move direction, Autopilot autopilot) {
        lastHeadDirection = direction;
        headDirection = direction;
        head = start;
        tail = new ArrayDeque<>();
        length = 2;
        this.id = id;
        dead = false;
        name = Optional.ofNullable(autopilot).map(Autopilot::generateName).orElseGet(() -> "Anon " + (id.getIdx() + 1));
        this.autopilot = autopilot;
    }

    public Snake(SnakeId id, Coordinate start){
        this(id, start, new Random());
    }

    public Snake(SnakeId id, Coordinate start, Move dir){
        this(id, start, dir, null);
    }

    public Snake(SnakeId id, Coordinate start, Random random){
        this(id, start, Move.random(random), null);
    }

    public Snake(SnakeId id, Coordinate start, Random random, Autopilot autopilot){
        this(id, start, Move.random(random), autopilot);
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
        return Optional.ofNullable(autopilot);
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

    public Coordinate step() {
        Coordinate offset = getHeadDirection().toCoord();
        lastHeadDirection = headDirection;

        tail.add(head.copy());

        while (tail.size() >= length + 1) {
            tail.remove();
        }

        head = head.add(offset);

        return head;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Snake snake = (Snake) o;
        return id.equals(snake.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
