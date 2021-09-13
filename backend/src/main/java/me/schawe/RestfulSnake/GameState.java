package me.schawe.RestfulSnake;

import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;
import java.util.Random;

@RedisHash("Snake")
public class GameState
        implements Serializable {
    String id;
    int width;
    int height;
    Coordinate food;
    Snake snake;
    int score;

    GameState() {
        id = gen_id();
        width = 10;
        height = 10;
        score = 0;
        snake = new Snake();
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

    public Snake getSnake() {
        return snake;
    }


    public static String gen_id() {
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

    private boolean occupied(Coordinate site) {
        return snake.tail.stream().anyMatch(c -> c.equals(site)) || snake.head.equals(site);
    }

    private Coordinate randomSite() {
        Coordinate site;
        do {
            site = new Coordinate((int) (Math.random() * width), (int) (Math.random() * height));
        } while (occupied(site));
        return site;
    }

    public void add_food() {
        food = randomSite();
    }

    public void update(Move move) {
        if(snake.dead) {
            return;
        }

        Move next = move.toNext(snake.head_direction);
        Coordinate offset = next.toCoord();
        snake.head_direction = next;

        snake.tail.add(snake.head.copy());

        if(snake.head.x < 0 || snake.head.x >= width || snake.head.y < 0 || snake.head.y >= height) {
            snake.dead = true;
        }

        if(snake.head.equals(food)) {
            snake.length += 1;
            score += 1;
            add_food();
        }

        while(snake.tail.size() >= snake.length + 1) {
            snake.tail.remove();
        }

        snake.head.add(offset);

        for(Coordinate i : snake.tail) {
            if (i.equals(snake.head)) {
                snake.dead = true;
            }
        }
    }
}

