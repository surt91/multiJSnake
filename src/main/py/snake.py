import pygame
from py4j.java_gateway import JavaGateway


class Snake:
    def __init__(self, vis):
        self.vis = vis
        if vis:
            pygame.init()

        gateway = JavaGateway()
        self.gameState = gateway.entry_point.getGameState()
        gateway.jvm.java.lang.System.out.println('Connected to Python!')

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]

        self.age = 0

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)
        self.age = 0

        return self.gameState.trainingState(self.idx)

    def render(self):
        if not self.vis:
            return
        scale = 20
        screen = pygame.display.set_mode((10 * scale, 10 * scale))
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
        self.age += 1
        self.gameState.turnRelative(self.idx, action)
        self.gameState.update()

        state = self.gameState.trainingState(self.idx)

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
                print("nom")
            self.age = 0
        elif self.age > 500:
            reward = -0.5
            done = True
            if self.vis:
                print("starved")

        return state, reward, done, "idk"

    def state_size(self):
        return len(self.gameState.trainingState(self.idx))

    def action_size(self):
        return 3

    def max_reward(self):
        return 300


if __name__ == "__main__":
    s = Snake()
    s.seed(42)
    s.render()
    s.step(0)
    s.render()
    import time
    time.sleep(20)
