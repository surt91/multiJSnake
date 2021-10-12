from py4j.java_gateway import JavaGateway


class Snake:
    def __init__(self):
        gateway = JavaGateway()
        self.gameState = gateway.entry_point.getGameState()
        gateway.jvm.java.lang.System.out.println('Connected to Python!')

        self.gameState.setPause(False)
        self.idx = self.gameState.addSnake()
        self.snake = self.gameState.getSnakes()[self.idx]

    def seed(self, seed):
        self.gameState.reseed(seed)
        self.reset()

    def reset(self):
        self.gameState.reset()
        self.gameState.setPause(False)
        return self.gameState.trainingState(self.idx)

    def render(self):
        pass

    def step(self, action):
        self.gameState.turnRelative(self.idx, action)
        self.gameState.update()

        state = self.gameState.trainingState(self.idx)

        done = False
        reward = 0
        if self.gameState.isGameOver():
            reward = -1
            done = True
        elif self.gameState.isEating(self.snake):
            reward = 1

        return state, reward, done, "idk"

    def state_size(self):
        return 10

    def action_size(self):
        return 3

    def max_reward(self):
        return 300
