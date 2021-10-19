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
    /// here we just take up to third nearest neighbor fields of the snake's head
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

    /// get the state of the game
    /// here we take bitmap of the field with multiple layers:
    /// first layer: 1: food, else 0
    /// second layer: 1: head of the current snake, else 0
    /// third layer: number of turns the site will be occupied by the tail of a snake
    /// this is inspired by https://towardsdatascience.com/learning-to-play-snake-at-1-million-fps-4aae8d36d2f1
    public int[][][] trainingBitmap(int idx) {
        Snake snake = snakes.get(idx);
        // this is initialized to 0 https://stackoverflow.com/a/2154340
        int[][][] state = new int[width][height][3];

        state[food.getX()][food.getY()][0] = 1;
        // the head can be outside of the field (after collision with a wall)
        if(!isWall(snake.head)) {
            state[snake.head.getX()][snake.head.getY()][1] = 1;
        }

        for(Snake s : getSnakes()) {
            int ctr = 1;
            for(Coordinate site : s.getTail()) {
                state[site.getX()][site.getY()][2] = ctr;
                ctr += 1;
            }
            if(!isWall(s.head)) {
                state[s.head.getX()][s.head.getY()][2] = ctr;
            }
        }

        // your own head is ok ... this is probably not necessary ...
        if(!isWall(snake.head)) {
            state[snake.head.getX()][snake.head.getY()][2] = 0;
        }

        return state;
    }

    public Move relativeAction2Move(int action, Move lastHeadDirection) {
        switch(action) {
            case 0:
                // left
                return lastHeadDirection.rLeft();
            case 1:
                // straight
                return lastHeadDirection.straight();
            case 2:
                // right
                return lastHeadDirection.rRight();
            default:
                throw new RuntimeException("invalid relative direction: " + action);
        }
    }

    public Move absoluteAction2Move(int action) {
        switch (action) {
            case 0:
                // north
                return Move.up;
            case 1:
                // east
                return Move.right;
            case 2:
                // south
                return Move.down;
            case 3:
                // west
                return Move.left;
            default:
                throw new RuntimeException("invalid absolute direction: " + action);
        }
    }

    // this takes two ints, because this is the way my training on the python side works
    public void turnRelative(int idx, int direction) {
        Snake snake = snakes.get(idx);
        if(snake.isDead()) {
            return;
        }

        snake.headDirection = relativeAction2Move(direction, snake.lastHeadDirection);

    }

    // this takes two ints, because this is the way my training on the python side works
    public void turnAbsolute(int idx, int direction) {
        Snake snake = snakes.get(idx);
        if(snake.isDead()) {
            return;
        }

        snake.headDirection = absoluteAction2Move(direction);
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

