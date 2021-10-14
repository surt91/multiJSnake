package me.schawe.multijsnake.snake;

import me.schawe.multijsnake.snake.ai.Autopilot;

import java.util.*;
import java.util.function.Consumer;

public class GameState {
    String id;
    int width;
    int height;
    public Coordinate food;
    HashMap<Integer, Snake> snakes;
    int score;
    boolean paused;
    boolean gameOver;
    List<Integer> toBeRemoved;
    Consumer<Snake> snakeDiesCallback;
    private Random random = new Random();

    public GameState(int width, int height) {
        id = gen_id();
        this.width = width;
        this.height = height;
        score = 0;
        snakes = new HashMap<>();
        toBeRemoved = new ArrayList<>();
        add_food();
        paused = true;
        gameOver = false;
        this.snakeDiesCallback = x -> {};
    }

    public GameState(int width, int height, long seed) {
        this(width, height);
        random = new Random(seed);
        add_food();
    }

    // if we fix the id, derive the RNG state from this id.
    // this is handy for tests, but might be a bit surprising
    public GameState(int width, int height, String id) {
        this(width, height);
        this.id = id;
        random = new Random(id.hashCode());
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

    public Coordinate getFood() {
        return food;
    }

    public int getScore() {
        return score;
    }

    public List<Snake> getSnakes() {
        return new ArrayList<>(snakes.values());
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

    public void changeName(int idx, String name) {
        snakes.get(idx).setName(name);
    }

    public void reseed(long seed) {
        random = new Random(seed);
    }

    public String gen_id() {
        // https://www.baeldung.com/java-random-string
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 10;

        return random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    public int addSnake() {
        int idx = snakes.size();
        snakes.put(idx, new Snake(idx, randomSite(), random));
        return idx;
    }

    public int addAISnake(Autopilot autopilot) {
        int idx = snakes.size();
        snakes.put(idx, new Snake(idx, randomSite(), random));
        snakes.get(idx).setAutopilot(autopilot);
        return idx;
    }

    // TODO: replace by a cheaper method (hashmap of occupied sites?) But probably does not matter for performance
    public boolean isOccupied(Coordinate site) {
        return snakes.values().stream().anyMatch(snake ->
            snake.tail.stream().anyMatch(c -> c.equals(site)) || snake.head.equals(site)
        );
    }

    public boolean isWall(Coordinate coordinate) {
        return coordinate.x < 0 || coordinate.x >= width || coordinate.y < 0 || coordinate.y >= height;
    }

    public boolean isEating(Snake snake) {
        return snake.head.equals(food);
    }

    // FIXME: this will become an infinite loop after a perfect game -- or after enough players spawned
    private Coordinate randomSite() {
        Coordinate site;
        do {
            site = new Coordinate((int) (random.nextFloat() * width), (int) (random.nextFloat() * height));
        } while (isOccupied(site));
        return site;
    }

    public void add_food() {
        food = randomSite();
    }

    public void turn(int idx, Move move) {
        Snake snake = snakes.get(idx);
        if(!snake.isDead()) {
            snake.headDirection = move.toNext(snake.lastHeadDirection)
                    .orElse(snake.headDirection);
        }
    }

    public int danger(Coordinate c) {
        if(isOccupied(c) || isWall(c)) {
            return 1;
        }
        return 0;
    }

    double angle(Coordinate subject, Move direction, Coordinate object) {
        double rad;
        double dx = object.getX() - subject.getX();
        double dy = object.getY() - subject.getY();

        // apply coordinate rotation, such that the snake always looks to the right
        // from the point of view of the atan
        // also note that our coordinate system grows down, so up points to lower values of y
        switch (direction) {
            case right:
                rad = -Math.atan2(dy, dx);
                break;
            case up:
                rad = Math.atan2(-dx, -dy);
                break;
            case left:
                rad = -Math.atan2(-dy, -dx);
                break;
            case down:
                rad = Math.atan2(dx, dy);
                break;
            default:
                throw new RuntimeException("unreachable!");
        }

        return rad;
    }

    /// get the state of the game
    /// here we just take the 8 fields around the current snakes head
    /// clockwise, starting with the field straight ahead
    /// 1: snake/wall
    /// 0: free
    /// and in which direction the food is
    /// 0/1: its in front
    /// 0/1: its left
    /// 0/1: its right
    public List<Integer> trainingState(int idx) {
        Snake snake = snakes.get(idx);
        ArrayList<Integer> state = new ArrayList<>();

        double rad = angle(snake.head, snake.headDirection, food);
        double eps = 1e-6;

        // is food in front?
        if (Math.abs(rad) < Math.PI / 2 - eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        // is food left?
        if (rad > eps && rad < Math.PI - eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        // is food right?
        if (rad < -eps && rad > -Math.PI + eps) {
            state.add(1);
        } else {
            state.add(0);
        }
        
        // is food behind?
        if (Math.abs(rad) > Math.PI/2. + eps) {
            state.add(1);
        } else {
            state.add(0);
        }

        Coordinate straight = snake.headDirection.toCoord();
        Coordinate left = snake.headDirection.rLeft().toCoord();
        Coordinate right = snake.headDirection.rRight().toCoord();
        Coordinate back = snake.headDirection.back().toCoord();

        // first neighbors
        state.add(danger(snake.head.add(left)));
        state.add(danger(snake.head.add(straight)));
        state.add(danger(snake.head.add(right)));
        // omit back, its always occupied

        // second neighbors
        state.add(danger(snake.head.add(back).add(left)));
        state.add(danger(snake.head.add(left).add(straight)));
        state.add(danger(snake.head.add(straight).add(right)));
        state.add(danger(snake.head.add(right).add(back)));

        // third neighbors
        state.add(danger(snake.head.add(left).add(left)));
        state.add(danger(snake.head.add(straight).add(straight)));
        state.add(danger(snake.head.add(right).add(right)));
        state.add(danger(snake.head.add(back).add(back)));

        return state;
    }

    // this takes two ints, because this is the way my training on the python side works
    public void turnRelative(int idx, int direction) {
        Snake snake = snakes.get(idx);
        if(snake.isDead()) {
            return;
        }

        switch(direction) {
            case 0:
                // left
                snake.headDirection = snake.lastHeadDirection.rLeft();
                break;
            case 1:
                // straight
                snake.headDirection = snake.lastHeadDirection.straight();
                break;
            case 2:
                // right
                snake.headDirection = snake.lastHeadDirection.rRight();
                break;
            default:
                throw new RuntimeException("invalid relative direction: " + direction);
        }
    }

    public void kill(int idx) {
        Snake snake = snakes.get(idx);
        // killing snakes twice does lead to double highscores
        if (!snake.isDead()) {
            snake.kill();
            snakeDiesCallback.accept(snake);
        }
    }

    public void markForRemoval(int idx) {
        toBeRemoved.add(idx);
    }

    public void reset() {
        for(int key : toBeRemoved) {
            snakes.remove(key);
        }
        toBeRemoved.clear();

        for(Snake snake : snakes.values()) {
            snake.reset(randomSite());
        }
        score = 0;
        add_food();
        paused = true;
        gameOver = false;
    }

    public void update() {
        if(gameOver) {
            return;
        }

        if(!paused) {
            for (Snake snake : snakes.values()) {
                if (snake.isDead()) {
                    continue;
                }

                snake.ai().ifPresent(autopilot -> snake.headDirection = autopilot.suggest(this, snake));

                Coordinate offset = snake.headDirection.toCoord();
                snake.lastHeadDirection = snake.headDirection;

                snake.tail.add(snake.head.copy());

                if (isEating(snake)) {
                    snake.length += 1;
                    score += 1;
                    add_food();
                }

                while (snake.tail.size() >= snake.length + 1) {
                    snake.tail.remove();
                }

                Coordinate next = snake.head.add(offset);
                if (isWall(next) || isOccupied(next)) {
                    kill(snake.idx);
                }

                snake.head = next;
            }
        }

        if(snakes.values().stream().allMatch(Snake::isDead)) {
            gameOver = true;
        }
    }
}

