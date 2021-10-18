package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;

import java.util.List;
import java.util.Random;

public class RandomAutopilot implements Autopilot {

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        List<Move> moves = possibleMoves(gameState, snake);
        if(moves.isEmpty()) {
            return Move.random();
        } else {
            Random random = new Random();
            int r = random.nextInt(moves.size());
            return moves.get(r);
        }
    }

    @Override
    public String generateName() {
         String[] names = {
                "Kzzt", "Bwok", "Blip", "Koaxi", "Dwook", "Kwok", "Vworp", "Trock", "Clanck",
                "Qwert", "Zyzzyx", "Blixt", "Bleep", "Fzzz", "Thwock", "Zonk", "Tessel",
                "Vrrr", "Whirr", "Flik", "Clack", "Vizz", "Klonk", "Zap", "Plonk",
                "Plink", "Klink", "Zpark", "Bzzt", "Cyl", "Wovv",
                "Klik", "Mekk", "Brrow", "Werx", "Gizmek", "Scy"
        };

        Random random = new Random();
        int r = random.nextInt(names.length);
        return names[r];
    }
}
