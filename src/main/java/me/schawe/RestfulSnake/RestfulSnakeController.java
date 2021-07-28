package me.schawe.RestfulSnake;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class RestfulSnakeController {
    Map map = new Map();

    @PostMapping("/move/{direction}")
    Map move_step(@PathVariable Move move) throws InvalidMoveException {
        map.update(move);

        return map;
    }
}
