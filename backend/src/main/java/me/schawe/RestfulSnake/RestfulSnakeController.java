package me.schawe.RestfulSnake;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
public class RestfulSnakeController {
    HashMap<String, Snake> map = new HashMap<>();

    @PostMapping("/init")
    Snake init() {
        Snake snake = new Snake();
        map.put(snake.id, snake);

        return snake;
    }

    @PostMapping("/{id}/move/{move}")
    Snake move_step(@PathVariable String id, @PathVariable Move move) {
        if(!map.containsKey(id)) {
            throw new InvalidMapException(id);
        }
        Snake snake = map.get(id);
        snake.update(move);

        return snake;
    }
}
