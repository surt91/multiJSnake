package me.schawe.multijsnake.highscore;

import me.schawe.multijsnake.gamemanagement.WebSocketService;
import me.schawe.multijsnake.snake.Snake;
import me.schawe.multijsnake.snake.SnakeDiesEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class NewHighscoreEventListener implements ApplicationListener<SnakeDiesEvent> {
    private final HighscoreRepository highscoreRepository;
    private final WebSocketService webSocketService;

    public NewHighscoreEventListener(HighscoreRepository highscoreRepository, WebSocketService webSocketService) {
        this.highscoreRepository = highscoreRepository;
        this.webSocketService = webSocketService;
    }

    private void updateHighscore(Snake snake, int size) {
        var score = snake.getLength();

        // do not save highscore for AI snakes
        // also do not save very low scores
        if (snake.ai().isPresent() || score < 5) {
            return;
        }

        Date date = new Date();
        Highscore highscore = new Highscore(score, snake.getName(), size, date);
        highscoreRepository.save(highscore);
        webSocketService.updateHighscore(size);
        webSocketService.updateGlobalHighscore();
    }

    @Override
    public void onApplicationEvent(SnakeDiesEvent event) {
        updateHighscore(event.getSnake(), event.getSize());
    }
}
