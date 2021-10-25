import sys
from abc import ABC, abstractmethod

import jpype
import jpype.imports
from jpype.types import *

# Launch the JVM
jpype.startJVM(classpath=['../../../target/classes'])
from me.schawe.multijsnake.snake import GameState


class Snake(ABC):
    @abstractmethod
    def get_state(self):
        pass

    @abstractmethod
    def state_size(self):
        pass

    @abstractmethod
    def do_action(self, action):
        pass

    def __init__(self, w=10, h=10, num=1):
        self.gameState = GameState(w, h)
        self.num = num

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]
        self.state = []

        self.already_dead = [False for _ in range(num)]

        self.others = []
        for _ in range(num - 1):
            idx = self.gameState.addSnake()
            self.others.append(idx)

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)
        self.already_dead = [False for _ in range(self.num)]

        return self.get_state()

    def render(self):
        if 'pygame' not in sys.modules:
            try:
                import pygame_sdl2 as pygame
            except ImportError:
                print("install pygame to show the visualization")
                return
            else:
                pygame.init()

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

        for s in self.gameState.getSnakes():
            pygame.draw.rect(
                screen,
                [140, 230, 140] if s.getIdx() == self.idx else [230, 140, 140],
                [scale * s.getHead().getX(), scale * s.getHead().getY(), scale, scale]
            )

            for i in s.getTailAsList():
                pygame.draw.rect(
                    screen,
                    [80, 230, 80]if s.getIdx() == self.idx else [230, 80, 80],
                    [scale * i.getX(), scale * i.getY(), scale, scale]
                )

        pygame.display.update()

    def step(self, action):
        self.do_action(action)
        self.gameState.update()

        state = self.get_state()
        self.state = state

        done = False
        reward = 0
        if self.snake.isDead() and not self.already_dead[0]:
            reward = -1
            self.already_dead[0] = True
        elif self.gameState.isEating(self.snake):
            reward = 1

        if self.gameState.isGameOver():
            done = True

        return state, reward, done

    def get_reward(self, idx):
        reward = 0
        if self.gameState.getSnakes()[idx].isDead() and not self.already_dead[idx]:
            reward = -1
            self.already_dead[0] = True
        elif self.gameState.isEating(self.gameState.getSnakes()[idx]):
            reward = 1
        return reward

    def max_reward(self):
        return 150


class LocalSnake(Snake):
    def get_state(self, idx=None):
        if idx is None:
            idx = self.idx
        return self.gameState.trainingState(idx)

    def state_size(self):
        return len(self.get_state())

    def do_action(self, action, idx=None):
        if idx is None:
            idx = self.idx
        self.gameState.turnRelative(idx, action)


class GlobalSnake(Snake):
    def get_state(self, idx=None):
        if idx is None:
            idx = self.idx
        return self.gameState.trainingBitmap(idx)

    def state_size(self):
        return (self.gameState.getWidth(), self.gameState.getHeight(), 3)

    def do_action(self, action, idx=None):
        if idx is None:
            idx = self.idx
        self.gameState.turnAbsolute(idx, action)
