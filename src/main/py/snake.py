import sys
from abc import ABC, abstractmethod
import random

import jpype
import jpype.imports
from jpype.types import *

# Launch the JVM
jpype.startJVM(classpath=['../../../target/classes'])
from me.schawe.multijsnake.snake import GameState, TrainingState


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
        self.trainingState = TrainingState(self.gameState)
        self.num_max = num
        self.num = num

        self.gameState.setPause(False)
        self.snakeId = self.gameState.addSnake()
        self.snake = self.gameState.getSnake(self.snakeId)
        self.state = []

        self.already_dead = {self.snakeId: False}

        self.others = []
        for _ in range(num - 1):
            snakeId = self.gameState.addSnake()
            self.others.append(snakeId)
            self.already_dead[snakeId] = False

    def resize_random(self, mini, maxi):
        w = random.randint(mini, maxi)
        h = random.randint(mini, maxi)

        self.gameState = GameState(w, h)
        self.trainingState = TrainingState(self.gameState)
        self.num = random.randint(1, self.num_max)

        self.gameState.setPause(False)
        self.snakeId = self.gameState.addSnake()
        self.snake = self.gameState.getSnake(self.snakeId)
        self.state = []

        self.already_dead = {self.snakeId: False}

        self.others = []
        for _ in range(self.num - 1):
            snakeId = self.gameState.addSnake()
            self.others.append(snakeId)
            self.already_dead[snakeId] = False

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)
        self.already_dead = {i: False for i in self.already_dead.keys()}

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

        for s in self.gameState.getSnakeSet():
            pygame.draw.rect(
                screen,
                [140, 230, 140] if s.getId() == self.snakeId else [230, 140, 140],
                [scale * s.getHead().getX(), scale * s.getHead().getY(), scale, scale]
            )

            points = [(scale * s.getHead().getX() + scale/2, scale * s.getHead().getY() + scale/2)]
            for i in reversed(s.getTailAsList()):
                points.append((scale * i.getX() + scale/2, scale * i.getY() + scale/2))

            if points:
                pygame.draw.lines(
                    screen,
                    [80, 230, 80] if s.getId() == self.snakeId else [230, 80, 80],
                    False,
                    points,
                    scale*0.8
                )

        pygame.display.update()

    def step(self, action):
        self.do_action(action)
        self.gameState.update()

        state = self.get_state()
        self.state = state

        done = False
        reward = 0
        if self.snake.isDead() and not self.already_dead[self.snakeId]:
            reward = -1
            self.already_dead[self.snakeId] = True
        elif self.gameState.isEating(self.snake):
            reward = 1

        if self.gameState.isGameOver():
            done = True

        return state, reward, done

    def get_reward(self, snakeId):
        reward = 0
        if self.gameState.getSnake(snakeId).isDead() and not self.already_dead[snakeId]:
            reward = -1
            self.already_dead[snakeId] = True
        elif self.gameState.isEating(self.gameState.getSnake(snakeId)):
            reward = 1
        return reward

    def is_dead(self, snakeId):
        return self.already_dead[snakeId]

    def max_reward(self):
        return 150


class LocalSnake(Snake):
    def get_state(self, snakeId=None):
        if snakeId is None:
            snakeId = self.snakeId
        return self.trainingState.vector(snakeId)

    def state_size(self):
        return len(self.get_state())

    def do_action(self, action, snakeId=None):
        if snakeId is None:
            snakeId = self.snakeId
        snake = self.gameState.getSnake(snakeId)
        move = self.trainingState.relativeAction2Move(action, snake.getLastHeadDirection())
        self.gameState.turn(snakeId, move)


class GlobalSnake(Snake):
    def get_state(self, snakeId=None):
        if snakeId is None:
            snakeId = self.snakeId
        return self.trainingState.bitmap(snakeId)

    def state_size(self):
        return (self.gameState.getWidth(), self.gameState.getHeight(), 3)

    def do_action(self, action, snakeId=None):
        if snakeId is None:
            snakeId = self.snakeId
        move = self.trainingState.absoluteAction2Move(action)
        self.gameState.turn(snakeId, move)
