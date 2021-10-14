# https://towardsdatascience.com/how-to-teach-an-ai-to-play-games-deep-reinforcement-learning-28f9b920440a

import sys
from glob import glob
import random
import collections

import tensorflow as tf
from tensorflow import keras
from keras.models import Sequential
from keras.layers.core import Dense
import numpy as np

from snake import Snake

# hyper-parameters
basename = "snakeDNQ"
max_steps_per_episode = 10000
memory_size = 100000
batch_size = 1000
adam_lr = 0.0007
training_duration = 80
fine_training_duration = 20


vis = "vis" in sys.argv
if not vis:
    print(f"If you want to see visualizations, call this script like `{sys.argv[0]} vis`")

env = Snake(vis)


class DQNAgent(object):
    def __init__(self):
        self.gamma = 0.9
        self.short_memory = np.array([])
        self.agent_target = 1
        self.agent_predict = 0
        self.epsilon = 1
        self.actual = []
        self.memory = collections.deque(maxlen=memory_size)
        self.model = self.network()

    def network(self):
        model = Sequential()
        model.add(Dense(256, activation='relu', input_dim=env.state_size()))
        model.add(Dense(env.action_size(), activation='softmax'))
        opt = keras.optimizers.Adam(adam_lr)
        #loss = keras.losses.Huber()
        model.compile(loss="mse", optimizer=opt)

        return model

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def train_long_memory(self):
        if len(self.memory) > batch_size:
            minibatch = random.sample(self.memory, batch_size)
        else:
            minibatch = self.memory

        states, actions, rewards, next_states, dones = zip(*minibatch)
        self.train_step(states, actions, rewards, next_states, dones)

    def train_short_memory(self, state, action, reward, next_state, done):
        self.train_step([state], [action], [reward], [next_state], [done])

    def train_step(self, state, action, reward, next_state, done):
        state = tf.convert_to_tensor(state)
        action = tf.convert_to_tensor(action)
        reward = tf.convert_to_tensor(reward)
        next_state = tf.convert_to_tensor(next_state)

        target = self.model.predict(state)
        for idx in range(len(done)):
            Q_new = reward[idx]
            if not done[idx]:
                tmp = self.model.predict(tf.convert_to_tensor([next_state[idx]]))
                Q_new = float(reward[idx]) + self.gamma * np.amax(tmp)

            target[idx][np.argmax(action[idx])] = Q_new

        self.model.fit(state, target, epochs=1, verbose=0)


def train():
    agent = DQNAgent()

    saves = globf(f"{basename}_e*.keras")
    if saves:

        latest = sorted(saves, key=lambda x: int(x.split(".")[0].split("_e")[1]))[-1]
        start = int(latest.split(".")[0].split("_e")[1])
        print(f"load `{latest}`")
        agent.model = keras.models.load_model(latest)
    else:
        start = 0

    episode_count = start

    while True:  # Run until solved
        state = env.reset()
        state = np.asarray(state)
        episode_reward = 0
        if episode_count < training_duration:
            epsilon = 1-(episode_count/training_duration)
        else:
            epsilon = 0.01*(1-(episode_count-training_duration)/fine_training_duration)

        for timestep in range(1, max_steps_per_episode):
            env.render()

            final_move = [0, 0, 0]
            if random.uniform(0, 1) < epsilon:
                move = int(random.randint(0, 2))
                final_move[move] = 1
            else:
                # predict action based on the old state
                prediction = agent.model.predict(state.reshape((1, env.state_size())))

                # choose according to weights
                # move = np.random.choice(env.action_size(), p=np.squeeze(prediction))
                # or choose the maximum
                move = int(np.argmax(prediction[0]))

                final_move[move] = 1
                print(state, prediction, move, final_move)

            state_old = state
            state, reward, done = env.step(move)
            state = np.asarray(state)

            # train short memory base on the new action and state
            agent.train_short_memory(state_old, final_move, reward, state, done)
            # store the new data into a long term memory
            agent.remember(state_old, final_move, reward, state, done)

            episode_reward += reward

            if done:
                break

        print("score:", episode_reward)
        print("eps:", epsilon)
        agent.train_long_memory()

        # Log details
        episode_count += 1
        if episode_count % 10 == 0:
            print(f"reward: {episode_reward:.2f} at episode {episode_count}")

        if episode_count % 50 == 0:
            agent.model.save(f"{basename}_e{episode_count}.keras")

        if episode_reward > env.max_reward():  # Condition to consider the task solved
            print("Solved at episode {}!".format(episode_count))
            break


train()
