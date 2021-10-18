import numpy as np
import pygame_sdl2 as pygame
from py4j.java_gateway import JavaGateway


class Snake:
    def __init__(self, vis, w=10, h=10):
        self.vis = vis
        if vis:
            pygame.init()

        gateway = JavaGateway()
        self.gameState = gateway.entry_point.getGameState(w, h)
        gateway.jvm.java.lang.System.out.println('Connected to Python!')

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]
        self.state = []

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)

        return self.gameState.trainingBitmap(self.idx)

    def render(self):
        if not self.vis:
            return
        scale = 20
        w = self.gameState.getWidth()
        h = self.gameState.getHeight()

        screen = pygame.display.set_mode((w * scale, h * scale))
        pygame.draw.rect(
            screen,
            [0, 0, 0],
            [0, 0, w * scale, h * scale]
        )

        food = self.gameState.getFood()
        pygame.draw.rect(
            screen,
            [230, 20, 20],
            [scale * food.getX(), scale * food.getY(), scale, scale]
        )

        pygame.draw.rect(
            screen,
            [140, 230, 140],
            [scale * self.snake.getHead().getX(), scale * self.snake.getHead().getY(), scale, scale]
        )

        for i in self.snake.getTailAsList():
            pygame.draw.rect(
                screen,
                [80, 230, 80],
                [scale * i.getX(), scale * i.getY(), scale, scale]
            )

        pygame.display.update()

    def step(self, action):
        self.gameState.turnAbsolute(self.idx, action)
        self.gameState.update()

        state = self.gameState.trainingBitmap(self.idx)
        self.state = state

        done = False
        reward = 0
        if self.gameState.isGameOver():
            reward = -1
            done = True
            if self.vis:
                print("dead")
        elif self.gameState.isEating(self.snake):
            reward = 1
            if self.vis:
                print("nom", end=" ")

        return state, reward, done

    def action_size(self):
        return 4

    def max_reward(self):
        return 150

    def state_size(self):
        return (self.gameState.getWidth(), self.gameState.getHeight(), 3)