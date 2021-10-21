"""
This script is very close to https://keras.io/examples/rl/actor_critic_cartpole/
"""

import sys
from glob import glob

import numpy as np
import tensorflow as tf
from tensorflow import keras


class AgentA2C:
    def __init__(
        self,
        basename,
        env,
        model,
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

        self.env = env

        self.episode_count = 0
        self.model = self.load_model_checkpoint()
        if self.model is None:
            self.model = model

        # init memory
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
            model = keras.models.load_model(latest)
            return model

        return None

    def remember(self, action_prob, critic_value, reward):
        self.action_probs_memory.append(action_prob)
        self.critic_value_memory.append(critic_value)
        self.rewards_memory.append(reward)

    def forget(self):
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
        discounted_rewards = discounted_rewards.tolist()

        return discounted_rewards

    def save(self, name):
        self.model.save(name)

    def train(self):
        optimizer = keras.optimizers.Adam(learning_rate=self.learning_rate)
        huber_loss = keras.losses.Huber()

        running_reward = 0

        while True:  # Run until solved
            state = self.env.reset()

            episode_reward = 0
            with tf.GradientTape() as tape:
                for timestep in range(self.max_steps_per_episode):
                    if self.vis:
                        self.env.render()

                    state = tf.convert_to_tensor([state])

                    # Predict action probabilities and estimated future rewards
                    # from environment state
                    action_probs, critic_value = self.model(state)

                    # Sample action from action probability distribution
                    probs = np.squeeze(action_probs)
                    action = np.random.choice(len(probs), p=probs)

                    # Apply the sampled action in our environment
                    state, reward, done = self.env.step(action)

                    self.remember(action_probs[0, action], critic_value[0, 0], reward)

                    episode_reward += reward

                    if done:
                        break

                # Update running reward to check condition for solving
                running_reward = 0.05 * episode_reward + (1 - 0.05) * running_reward

                discounted_rewards = self.discount(self.rewards_memory)

                # Calculating loss values to update our network
                history = zip(self.action_probs_memory, self.critic_value_memory, discounted_rewards)
                actor_losses = []
                critic_losses = []
                for prob, value, ret in history:
                    # At this point in history, the critic estimated that we would get a
                    # total reward = `value` in the future. We took an action with log probability
                    # of `log_prob` and ended up recieving a total reward = `ret`.
                    # The actor must be updated so that it predicts an action that leads to
                    # high rewards (compared to critic's estimate) with high probability.
                    advantage = ret - value
                    log_prob = tf.math.log(prob)
                    actor_losses.append(-log_prob * advantage)  # actor loss

                    # The critic must be updated so that it predicts a better estimate of
                    # the future rewards.
                    critic_losses.append(
                        huber_loss(tf.expand_dims(value, 0), tf.expand_dims(ret, 0))
                    )

                # Backpropagation
                loss_value = sum(actor_losses) + sum(critic_losses)
                grads = tape.gradient(loss_value, self.model.trainable_variables)
                optimizer.apply_gradients(zip(grads, self.model.trainable_variables))

                # Clear the loss and reward history
                self.forget()

            # Log details
            self.episode_count += 1
            if self.episode_count % 10 == 0:
                template = "running reward: {:.2f} at episode {}"
                print(template.format(running_reward, self.episode_count))

            if self.episode_count < 1000 and self.episode_count % 100 == 0 or self.episode_count % 1000 == 0:
                self.model.save(f"{self.basename}_e{self.episode_count}.keras")

            if running_reward > self.env.max_reward():  # Condition to consider the task solved
                print("Solved at episode {}!".format(self.episode_count))
                break

            if "--test" in sys.argv:
                sys.exit()

        self.model.save(f'{self.basename}.keras')


if __name__ == "__main__":
    vis = "vis" in sys.argv
    if not vis:
        print(f"If you want to see visualizations, call this script like `{sys.argv[0]} vis`")

    agent = Agent("snakeAC", vis=vis)

    try:
        agent.train()
    except:
        agent.save(f'checkpoint_e{agent.episode_count}.keras')
