package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.gamemanagement.InvalidMapException;
import me.schawe.multijsnake.snake.ai.Autopilot;

import java.util.*;
import java.util.function.Consumer;

public class GameState {
    private final String id;
    private final int width;
    private final int height;
    private Coordinate food;
    private final HashMap<SnakeId, Snake> snakes;
    private int score;
    private boolean paused;
    private boolean gameOver;
    private final List<SnakeId> toBeRemoved;
    // TODO: replace by event listener
    private Consumer<Snake> snakeDiesCallback;
    private final Random random;
    private int monotonousSnakeCounter;

    public GameState(int width, int height, Random random, String id) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.random = random;

        score = 0;
        snakes = new HashMap<>();
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
        Map<Integer, Snake> out = new HashMap<>();
        for(Map.Entry<SnakeId, Snake> entry : snakes.entrySet()) {
            out.put(entry.getKey().getIdx(), entry.getValue());
        }
        return out;
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
        return addSnake(randomSite());
    }

    public SnakeId addSnake(Coordinate coordinate) {
        return addSnake(coordinate, Move.random(random));
    }

    public SnakeId addSnake(Coordinate coordinate, Move direction) {
        return addSnake(coordinate, direction, Optional.empty());
    }

    public SnakeId addAISnake(Autopilot autopilot) {
        return addSnake(randomSite(), Move.random(random), Optional.of(autopilot));
    }

    public SnakeId addSnake(Coordinate coordinate, Move direction, Optional<Autopilot> autopilot) {
        int idx = monotonousSnakeCounter++;
        SnakeId snakeId = new SnakeId(this.id, idx);
        Snake snake = new Snake(snakeId, coordinate, direction, autopilot);
        snakes.put(snakeId, snake);
        return snakeId;
    }

    // TODO: replace by a cheaper method (hashmap of occupied sites?) But probably does not matter for performance
    public boolean isOccupied(Coordinate site) {
        return snakes.values().stream().anyMatch(snake ->
            snake.getTail().stream().anyMatch(c -> c.equals(site)) || snake.getHead().equals(site)
        );
    }

    public boolean isWall(Coordinate coordinate) {
        return coordinate.getX() < 0
                || coordinate.getX() >= width
                || coordinate.getY() < 0
                || coordinate.getY() >= height;
    }

    public boolean isEating(Snake snake) {
        return snake.getHead().equals(food);
    }

    private Coordinate randomSite() {
        if(checkPerfectGame()) {
            // this should have been checked, and should therefore not happen
            throw new RuntimeException("Perfect Game!");
        }

        Coordinate site;
        do {
            site = randomSiteAll();
        } while (isOccupied(site));
        return site;
    }

    private Coordinate randomSiteAll() {
        return new Coordinate((int) (random.nextFloat() * width), (int) (random.nextFloat() * height));
    }

    public void addFood() {
        addFood(randomSite());
    }

    public void addFood(Coordinate coordinate) {
        food = coordinate;
    }

    // TODO: call turn method on snake?
    public void turn(SnakeId id, Move move) {
        Snake snake = getSnake(id);
        if(!snake.isDead()) {
            snake.setHeadDirection(
                    move.toNext(snake.getLastHeadDirection())
                        .orElse(snake.getHeadDirection())
            );
        }
    }

    public boolean checkPerfectGame() {
        int occupied_fields = snakes.values().stream()
                .map(snake -> snake.getLength() + 1)  // +1 for the heads
                .mapToInt(Integer::intValue)
                .sum();
        return occupied_fields == width * height - 1; // -1 to place new food
    }

    public void kill(SnakeId id) {
        Snake snake = getSnake(id);
        // killing snakes twice would lead to double highscores
        if (!snake.isDead()) {
            snake.kill();
            snakeDiesCallback.accept(snake);
        }
    }

    // check whether this game was abandoned by all human players
    public boolean isAbandoned() {
        long numActivePlayers = snakes.values().stream()
                .filter(snake -> snake.ai().isEmpty() && !toBeRemoved.contains(snake.getId()))
                .count();

        // games can only be created by joining, so if there are no active players, it is abandoned
        return numActivePlayers == 0;
    }

    public void markForRemoval(SnakeId id) {
        toBeRemoved.add(id);
    }

    public void reset() {
        for(SnakeId snakeId : toBeRemoved) {
            snakes.remove(snakeId);
        }
        toBeRemoved.clear();

        for(Snake snake : snakes.values()) {
            snake.reset(randomSiteAll());
        }
        score = 0;
        addFood();
        paused = true;
        gameOver = false;
    }

    public void update() {
        if(checkPerfectGame()) {
            gameOver = true;
        }

        if(gameOver) {
            return;
        }

        if(!paused) {
            for (Snake snake : snakes.values()) {
                if (snake.isDead()) {
                    continue;
                }

                snake.ai().ifPresent(autopilot -> snake.setHeadDirection(autopilot.suggest(this, snake)));

                Coordinate offset = snake.getHeadDirection().toCoord();
                snake.setLastHeadDirection(snake.getHeadDirection());

                snake.getTail().add(snake.getHead().copy());

                if (isEating(snake)) {
                    addFood();
                    snake.incrementLength();
                    score += 1;
                }

                while (snake.getTail().size() >= snake.getLength() + 1) {
                    snake.getTail().remove();
                }

                Coordinate next = snake.getHead().add(offset);
                if (isWall(next) || isOccupied(next)) {
                    kill(snake.getId());
                }

                snake.setHead(next);
            }
        }

        if(snakes.values().stream().allMatch(Snake::isDead)) {
            gameOver = true;
        }
    }
}

