package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.gamemanagement.exceptions.InvalidMapException;
import me.schawe.multijsnake.snake.ai.Autopilot;
import me.schawe.multijsnake.util.IdGenerator;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Consumer;
import java.util.stream.Collectors;

public class GameState {
    private final String id;
    private final int width;
    private final int height;
    private Coordinate food;
    private final Map<SnakeId, Snake> snakes;
    private Set<Coordinate> occupationMap;
    private int score;
    private boolean paused;
    private boolean gameOver;
    private final List<SnakeId> toBeRemoved;
    // TODO: replace by event listener
    private Consumer<Snake> snakeDiesCallback;
    private final Random random;
    private int monotonousSnakeCounter;
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

    public GameState(int width, int height, Random random, String id) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.random = random;

        score = 0;
        snakes = new HashMap<>();
        occupationMap = new HashSet<>();
        toBeRemoved = new ArrayList<>();
        addFood();
        paused = true;
        gameOver = false;
        this.snakeDiesCallback = x -> {};

        monotonousSnakeCounter = 0;
    }

    public GameState(int width, int height, long seed) {
        this(width, height, new Random(seed), IdGenerator.gen(new Random(seed)));
    }

    // if we fix the id, derive the RNG state from this id.
    // this is handy for tests, but might be a bit surprising
    public GameState(int width, int height, String id) {
        this(width, height, new Random(id.hashCode()), id);
    }

    public GameState(int width, int height) {
        this(width, height, new Random(), IdGenerator.gen(new Random()));
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

    public Coordinate getFood() {
        return food;
    }

    public int getScore() {
        return score;
    }

    public Map<Integer, Snake> getSnakes() {
        rwLock.readLock().lock();
        try {
            return snakes.entrySet().stream()
                    .collect(Collectors.toMap(entry -> entry.getKey().getIdx(), Map.Entry::getValue));
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public Collection<Snake> getSnakeSet() {
        return snakes.values();
    }

    public Snake getSnake(SnakeId snakeId) {
        if (!snakeId.getId().equals(id)) {
            throw new InvalidMapException("snake " + snakeId + " does not live in GameState " + snakeId.getId());
        }

        return snakes.get(snakeId);
    }

    public boolean isPaused() {
        return paused;
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public void setPause(boolean paused) {
        this.paused = paused;
    }

    public void setSnakeDiesCallback(Consumer<Snake> snakeDiesCallback) {
        this.snakeDiesCallback = snakeDiesCallback;
    }

    public void changeName(SnakeId id, String name) {
        snakes.get(id).setName(name);
    }

    public SnakeId addSnake() {
        return addSnake(randomUnoccupiedSite());
    }

    public SnakeId addSnake(Coordinate coordinate) {
        return addSnake(coordinate, Move.random(random));
    }

    public SnakeId addSnake(Coordinate coordinate, Move direction) {
        return addSnake(coordinate, direction, null);
    }

    public SnakeId addAISnake(Autopilot autopilot) {
        return addSnake(randomUnoccupiedSite(), Move.random(random), autopilot);
    }

    public SnakeId addSnake(Coordinate coordinate, Move direction, Autopilot autopilot) {
        rwLock.writeLock().lock();
        try {
            int idx = monotonousSnakeCounter++;
            SnakeId snakeId = new SnakeId(this.id, idx);
            Snake snake = new Snake(snakeId, coordinate, direction, autopilot);
            snakes.put(snakeId, snake);
            return snakeId;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    // signal if a site is occupied by either tail or head
    public boolean isOccupied(Coordinate site) {
        rwLock.readLock().lock();
        try {
            Set<Coordinate> heads = snakes.values().stream()
                    .map(Snake::getHead)
                    .collect(Collectors.toSet());
            return occupationMap.contains(site) || heads.contains(site);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    // signal if a site is occupied for the specified snake by either tail or head, except its own head
    public boolean isOccupied(Coordinate site, Snake snake) {
        rwLock.readLock().lock();
        try {
            Set<Coordinate> otherHeads = snakes.values().stream()
                    .filter(s -> !s.equals(snake))
                    .map(Snake::getHead)
                    .collect(Collectors.toSet());

            return occupationMap.contains(site) || otherHeads.contains(site);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public boolean isWall(Coordinate coordinate) {
        rwLock.readLock().lock();
        try {
            return coordinate.getX() < 0
                    || coordinate.getX() >= width
                    || coordinate.getY() < 0
                    || coordinate.getY() >= height;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public boolean isEating(Snake snake) {
        rwLock.readLock().lock();
        try {
            return snake.getHead().equals(food);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    private Coordinate randomUnoccupiedSite() {
        rwLock.readLock().lock();
        try {
            if(checkPerfectGame()) {
                // this should have been checked, and should therefore not happen
                throw new RuntimeException("Perfect Game!");
            }

            Coordinate site;
            do {
                site = randomSite();
            } while (isOccupied(site));
            return site;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    private Coordinate randomSite() {
        return new Coordinate((int) (random.nextFloat() * width), (int) (random.nextFloat() * height));
    }

    public void addFood() {
        addFood(randomUnoccupiedSite());
    }

    public void addFood(Coordinate coordinate) {
        rwLock.writeLock().lock();
        try {
            food = coordinate;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    // TODO: call turn method on snake?
    public void turn(SnakeId id, Move move) {
        rwLock.writeLock().lock();
        try {
            Snake snake = getSnake(id);
            if(!snake.isDead()) {
                snake.setHeadDirection(
                        move.toNext(snake.getLastHeadDirection())
                            .orElse(snake.getHeadDirection())
                );
            }
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public boolean checkPerfectGame() {
        rwLock.readLock().lock();
        try {
            int occupied_fields = snakes.values().stream()
                    .map(snake -> snake.getLength() + 1)  // +1 for the heads
                    .mapToInt(Integer::intValue)
                    .sum();
            return occupied_fields == width * height - 1; // -1 to place new food
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void kill(SnakeId id) {
        rwLock.writeLock().lock();
        try {
            Snake snake = getSnake(id);
            // killing snakes twice would lead to double highscores
            if (!snake.isDead()) {
                snake.kill();
                snakeDiesCallback.accept(snake);
            }
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    // check whether this game was abandoned by all human players
    public boolean isAbandoned() {
        rwLock.readLock().lock();
        try {
            long numActivePlayers = snakes.values().stream()
                    .filter(snake -> snake.ai().isEmpty() && !toBeRemoved.contains(snake.getId()))
                    .count();

            // games can only be created by joining, so if there are no active players, it is abandoned
            return numActivePlayers == 0;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void markForRemoval(SnakeId id) {
        rwLock.writeLock().lock();
        try {
            toBeRemoved.add(id);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void reset() {
        rwLock.writeLock().lock();
        try {
            for(SnakeId snakeId : toBeRemoved) {
                snakes.remove(snakeId);
            }
            toBeRemoved.clear();

            for(Snake snake : snakes.values()) {
                snake.reset(randomSite());
            }
            score = 0;
            addFood();
            paused = true;
            gameOver = false;
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    public void update() {
        rwLock.writeLock().lock();
        try {
            if(checkPerfectGame()) {
                gameOver = true;
            }

            if(gameOver) {
                return;
            }

            if(paused) {
                return;
            }

            for (Snake snake : snakes.values()) {
                if (snake.isDead()) {
                    continue;
                }

                snake.ai().ifPresent(autopilot -> snake.setHeadDirection(autopilot.suggest(this, snake)));

                if (isEating(snake)) {
                    addFood();
                    snake.incrementLength();
                    score += 1;
                }

                snake.step();
            }

            // update the occupation map after movement
            occupationMap = snakes.values().stream()
                .flatMap(snake -> snake.getTail().stream())
                .collect(Collectors.toSet());

            // check if any snakes stepped on occupied sites
            for (Snake snake : snakes.values()) {
                Coordinate head = snake.getHead();
                if (isWall(head) || isOccupied(head, snake)) {
                    kill(snake.getId());
                }
            }

            if(snakes.values().stream().allMatch(Snake::isDead)) {
                gameOver = true;
            }
        } finally {
            rwLock.writeLock().unlock();
        }
    }
}

