"""
This script is very close to https://keras.io/examples/rl/actor_critic_cartpole/
"""

import sys

from tensorflow import keras
from tensorflow.keras import layers

from snake import LocalSnake
from agentA2C import AgentA2C


def model(num_inputs):
    num_actions = 3
    num_hidden = 256

    inputs = layers.Input(shape=(num_inputs,))
    common = layers.Dense(num_hidden, activation="relu")(inputs)
    action = layers.Dense(num_actions, activation="softmax")(common)
    critic = layers.Dense(1)(common)

    model = keras.Model(inputs=inputs, outputs=[action, critic])

    return model


if __name__ == "__main__":
    vis = "vis" in sys.argv
    if not vis:
        print(f"If you want to see visualizations, call this script like `{sys.argv[0]} vis`")

    name = "snakeA2C"
    env = LocalSnake(10, 10)
    agent = AgentA2C(name, env, model(env.state_size()), vis=vis, gamma=0.9)

    try:
        agent.train()
    except:
        agent.save(f'checkpoint_{name}_e{agent.episode_count}.keras')
