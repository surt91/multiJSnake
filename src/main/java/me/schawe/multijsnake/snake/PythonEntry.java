package me.schawe.multijsnake.snake;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import py4j.GatewayServer;

// This class enables external calls from python to the GameState object.
// This is especially useful to apply the vast machine learning ecosystem
// of Python to train an AI to steer the snake.

@Component
public class PythonEntry implements CommandLineRunner {

    private final GameState gameState;

    public PythonEntry() {
        gameState = new GameState(10, 10);
    }

    public GameState getGameState() {
        return gameState;
    }

    public void run(String... args) {
        GatewayServer gatewayServer = new GatewayServer(new PythonEntry());
        gatewayServer.start();
        System.out.println("Python Gateway Server Started");
    }
}