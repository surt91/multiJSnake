"""
This script is very close to https://keras.io/examples/rl/actor_critic_cartpole/
with elements from https://github.com/pawel-kieliszczyk/snake-reinforcement-learning
and https://towardsdatascience.com/learning-to-play-snake-at-1-million-fps-4aae8d36d2f1
"""

import sys
from tensorflow import keras
from tensorflow.keras import layers

from snake import GlobalSnake
from agentPPO import AgentPPO


def model():
    num_actions = 4

    inputs = layers.Input(shape=(None, None, 3))
    conv1 = layers.Conv2D(64, (3, 3), padding='same', activation='relu')(inputs)
    conv2 = layers.Conv2D(64, (3, 3), padding='same', activation='relu')(conv1)
    conv3 = layers.Conv2D(64, (3, 3), padding='same', activation='relu')(conv2)
    conv_final = layers.Conv2D(64, (3, 3), padding='same', activation='relu')(conv3)

    common1 = layers.GlobalMaxPool2D()(conv_final)
    common2 = layers.Dense(64, activation="relu")(common1)

    action = layers.Dense(num_actions, activation="softmax")(common2)
    critic = layers.Dense(1)(common2)

    model = keras.Model(inputs=inputs, outputs=[action, critic])

    return model


if __name__ == "__main__":
    vis = "vis" in sys.argv
    if not vis:
        print(f"If you want to see visualizations, call this script like `{sys.argv[0]} vis`")

    name = "snakeConvPPO"
    agent = AgentPPO(name, GlobalSnake(10, 10), model(), vis=vis, gamma=0.99, learning_rate=0.0003)

    # training this much deeper net with far larger input takes more time, especially in the beginning to
    # see any kind of improvement
    try:
        agent.train()
    except:
        if agent.episode_count > 0:
            agent.save(f'checkpoint_{name}_e{agent.episode_count}.keras')
        raise
