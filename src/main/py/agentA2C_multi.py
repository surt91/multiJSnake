"""
This script is very close to https://keras.io/examples/rl/actor_critic_cartpole/
"""

import sys
from glob import glob
import collections

import numpy as np
import tensorflow as tf
from tensorflow import keras


class Experience:
    def __init__(self):
        self.states = []
        self.chosen_action = []
        self.chosen_action_prob = []
        self.action_probs = []
        self.critic_value = []
        self.rewards = []

    def remember(self, state, chosen_action, action_probs, critic_value, reward):
        self.states.append(state)
        self.chosen_action.append(chosen_action)
        self.chosen_action_prob.append(action_probs[chosen_action])
        self.action_probs.append(action_probs)
        self.critic_value.append(critic_value)
        self.rewards.append(reward)

    def forget(self):
        self.states.clear()
        self.chosen_action.clear()
        self.chosen_action_prob.clear()
        self.action_probs.clear()
        self.critic_value.clear()
        self.rewards.clear()


class AgentA2C:
    def __init__(
        self,
        basename,
        env,
        model,
        num_actions,
        gamma=0.99,
        loss_weight_entropy=5e-3,
        max_steps_per_episode=10**4,
        learning_rate=0.001,
        vis=False,
    ):

        self.basename = basename
        self.gamma = gamma
        self.max_steps_per_episode = max_steps_per_episode
        self.learning_rate = learning_rate
        self.vis = vis

        self.num_actions = num_actions

        self.loss_weight_entropy = loss_weight_entropy

        self.env = env

        self.boring = 0

        self.episode_count = 0

        self.model = self.load_model_checkpoint()
        if self.model is None:
            self.model = model

        self.model.compile(
            loss=[self.actor_loss, keras.losses.Huber()],
            optimizer=keras.optimizers.Adam(learning_rate)
        )

        self.model.summary()

        # init memory
        self.experiences = [Experience() for _ in range(self.env.num)]

    def load_model_checkpoint(self):
        # load a snapshot, if we have one
        saves = glob(f"checkpoint_{self.basename}_e*.keras")
        if saves:
            latest = sorted(saves, key=lambda x: int(x.split(".")[0].split("_e")[1]))[-1]
            self.episode_count = int(latest.split(".")[0].split("_e")[1])
            print(f"load `{latest}`")
            model = keras.models.load_model(latest, custom_objects={"actor_loss": self.actor_loss})
            return model

        return None

    def discount(self, rewards):
        # Calculate expected value from rewards
        # - At each timestep what was the total reward received after that timestep
        # - Rewards in the past are discounted by multiplying them with gamma
        # - These are the labels for our critic
        eps = np.finfo(np.float32).eps.item()
        discounted_rewards = np.zeros(len(rewards))
        discounted_sum = 0
        for (n, r) in reversed(list(enumerate(rewards))):
            discounted_sum = r + self.gamma * discounted_sum
            discounted_rewards[n] = discounted_sum

        # Normalize
        discounted_rewards = (discounted_rewards - np.mean(discounted_rewards)) / (np.std(discounted_rewards) + eps)

        return discounted_rewards

    def save(self, name):
        self.model.save(name)

    def actor_loss(self, actions_and_advantages, predicted):
        action = actions_and_advantages[:, 0]
        advantage = actions_and_advantages[:, 1]

        # this is equal to:
        # action = tf.one_hot(actions, self.num_actions)
        # prob = tf.reduce_sum(predicted * action, 1)
        # policy_loss = -tf.reduce_mean(tf.math.log(prob) * advantage)

        scce = keras.losses.SparseCategoricalCrossentropy()
        actions = tf.cast(action, tf.int32)
        policy_loss = scce(actions, predicted, sample_weight=advantage)

        # the entropy loss to maximize entropy to encourage exploration
        entropy_loss = tf.reduce_mean(tf.reduce_sum(-predicted * tf.math.log(predicted), 1))

        return policy_loss - self.loss_weight_entropy * entropy_loss

    def train(self):
        running_reward = collections.deque(maxlen=20)

        while True:  # Run until solved
            state = self.env.reset()
            state = np.asarray(state)

            episode_reward = 0
            for timestep in range(self.max_steps_per_episode):
                if self.vis:
                    self.env.render()

                # Predict action probabilities and estimated future rewards
                # from environment state
                action_probs, critic_value = self.model(np.asarray([state]))

                # move other snakes
                if self.env.others:
                    other_states = []
                    for i in self.env.others:
                        other_states.append(self.env.get_state(i))
                    other_actions, other_values = self.model(np.asarray(other_states))
                    other_action = np.argmax(other_actions, axis=1)
                    for i, a in zip(self.env.others, other_action):
                        self.env.do_action(a, i)

                # Sample action from action probability distribution
                probs = np.squeeze(action_probs)
                try:
                    action = np.random.choice(len(probs), p=probs)
                except:
                    print(probs)
                    raise

                # Apply the sampled action in our environment
                new_state, reward, done = self.env.step(action)
                new_state = np.asarray(new_state)

                if self.boring > 500:
                    reward = -10
                    done = True
                if reward != 0:
                    self.boring = 0

                if not self.env.is_dead(0):
                    self.experiences[0].remember(state, action, action_probs[0, :], critic_value[0, 0], reward)
                for i in self.env.others:
                    if self.env.is_dead(i):
                        continue
                    r = self.env.get_reward(i)
                    if self.boring > 500:
                        r = -10
                        done = True
                    if r != 0:
                        self.boring = 0
                    self.experiences[i].remember(state, other_action[i - 1], other_actions[i - 1, :], other_values[i - 1, 0], r)

                state = new_state

                episode_reward += reward
                self.boring += 1

                if done:
                    break

            # Update running reward to check condition for solving
            running_reward.append(episode_reward)

            for i in [self.env.idx] + self.env.others:
                if len(self.experiences[i].chosen_action) == 0:
                    self.experiences[i].forget()
                    continue

                discounted_rewards = self.discount(self.experiences[i].rewards)
                advantage = discounted_rewards - np.asarray(self.experiences[i].critic_value)

                actions_and_advantages = np.hstack([
                    np.vstack(self.experiences[i].chosen_action),
                    np.vstack(advantage)
                ])
                discounted_rewards = np.vstack(discounted_rewards)

                # model.fit does lead to rapid deterioation of the performance of the convolutional model
                # ... for some reason (maybe caused by training on small batches instead of the full trajectory?)
                # self.model.fit(np.asarray(self.experiences[i].states), [actions_and_advantages, discounted_rewards], verbose=2)
                self.model.train_on_batch(np.asarray(self.experiences[i].states), [actions_and_advantages, discounted_rewards])

                # Clear the loss and reward history
                self.experiences[i].forget()

            # Log details
            self.episode_count += 1
            if self.episode_count % 10 == 0:
                template = "running reward: {:.2f} at episode {}"
                print(template.format(np.mean(running_reward), self.episode_count))

            if self.episode_count < 1000 and self.episode_count % 100 == 0 or self.episode_count % 1000 == 0:
                self.model.save(f"{self.basename}_e{self.episode_count}.keras")

            if np.mean(running_reward) > self.env.max_reward():  # Condition to consider the task solved
                print("Solved at episode {}!".format(self.episode_count))
                break

            if "--test" in sys.argv:
                sys.exit()

        self.model.save(f'{self.basename}.keras')
