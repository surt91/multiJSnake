package me.schawe.RestfulSnake;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

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

@Configuration
@EnableWebMvc
class WebConfig extends WebMvcConfigurerAdapter {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**");
    }
}