"""
This script is inspired by
* https://keras.io/examples/rl/actor_critic_cartpole/
* https://keras.io/examples/rl/ppo_cartpole/
* http://inoryy.com/post/tensorflow2-deep-reinforcement-learning/
* https://pylessons.com/PPO-reinforcement-learning/
"""

import sys
from glob import glob
import collections

import numpy as np
import tensorflow as tf
from tensorflow import keras


class AgentPPO:
    def __init__(
        self,
        basename,
        env,
        model,
        num_actions,
        gamma=0.99,
        max_steps_per_episode=10**4,
        learning_rate=0.001,
        vis=False,
    ):

        self.basename = basename
        self.gamma = gamma
        self.max_steps_per_episode = max_steps_per_episode
        self.learning_rate = learning_rate
        self.vis = vis

        self.loss_weight_entropy = 5e-3
        self.epsilon = 0.2

        self.num_actions = num_actions

        self.env = env

        self.episode_count = 0

        self.model = self.load_model_checkpoint()
        if self.model is None:
            self.model = model

        self.model.compile(
            loss=[self.actor_loss, keras.losses.Huber()],
            optimizer=keras.optimizers.Adam(learning_rate)
        )

        # init memory
        self.states_memory = []
        self.chosen_action_memory = []
        self.chosen_action_prob_memory = []
        self.action_probs_memory = []
        self.critic_value_memory = []
        self.rewards_memory = []

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

    def remember(self, state, chosen_action, action_probs, critic_value, reward):
        self.states_memory.append(state)
        self.chosen_action_memory.append(chosen_action)
        self.chosen_action_prob_memory.append(action_probs[chosen_action])
        self.action_probs_memory.append(action_probs)
        self.critic_value_memory.append(critic_value)
        self.rewards_memory.append(reward)

    def forget(self):
        self.states_memory.clear()
        self.chosen_action_memory.clear()
        self.chosen_action_prob_memory.clear()
        self.action_probs_memory.clear()
        self.critic_value_memory.clear()
        self.rewards_memory.clear()

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
        eps = np.finfo(np.float32).eps.item()
        advantage = actions_and_advantages[:, 0]
        action = actions_and_advantages[:, 1:self.num_actions + 1]
        action_probs = actions_and_advantages[:, self.num_actions + 1:]

        prob = tf.reduce_sum(predicted * action, 1)
        old_prob = tf.reduce_sum(action * action_probs, 1)

        r = prob / (old_prob + eps)
        p1 = r * advantage
        p2 = keras.backend.clip(r, min_value=1 - self.epsilon, max_value=1 + self.epsilon) * advantage

        policy_loss = -keras.backend.mean(keras.backend.minimum(p1, p2))
        policy_loss = tf.cast(policy_loss, tf.float32)

        # the entropy loss to maximize entropy (close to uniform) to encourage exploration
        entropy_loss = keras.losses.categorical_crossentropy(predicted, predicted)

        loss = policy_loss - self.loss_weight_entropy * entropy_loss
        return loss

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
                action_probs, critic_value = self.model(tf.convert_to_tensor([state]))

                # Sample action from action probability distribution
                probs = np.squeeze(action_probs)
                action = np.random.choice(len(probs), p=probs)

                # Apply the sampled action in our environment
                new_state, reward, done = self.env.step(action)
                new_state = np.asarray(new_state)

                self.remember(state, action, action_probs[0, :], critic_value[0, 0], reward)
                state = new_state

                episode_reward += reward

                if done:
                    break

            # Update running reward to check condition for solving
            running_reward.append(episode_reward)

            discounted_rewards = self.discount(self.rewards_memory)
            advantage = discounted_rewards - np.asarray(self.critic_value_memory)
            action_onehot = tf.one_hot(self.chosen_action_memory, self.num_actions)

            actions_and_advantages = np.hstack([
                np.vstack(advantage),
                action_onehot,
                self.action_probs_memory,
            ])
            discounted_rewards = np.vstack(discounted_rewards)

            self.model.fit(np.asarray(self.states_memory), [actions_and_advantages, discounted_rewards], verbose=0)

            # Clear the loss and reward history
            self.forget()

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
