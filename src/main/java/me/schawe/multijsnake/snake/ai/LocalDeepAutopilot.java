package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;
import me.schawe.multijsnake.snake.TrainingState;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;

public class LocalDeepAutopilot extends KerasModelAutopilot {

    public LocalDeepAutopilot(String pathToModel, boolean isFunctional) {
        super(pathToModel, isFunctional);
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        // infer
        var state = new TrainingState(gameState).vector(snake.getId());
        INDArray input = Nd4j.create(state).reshape(1, state.size());

        INDArray output;
        if(modelSequential != null) {
            output = modelSequential.output(input);
        } else if(modelFunctional != null) {
            output = modelFunctional.output(input)[0];
        } else {
            gameState.kill(snake.getId());
            throw new RuntimeException("failed to load model `" + pathToModel + "`");
        }

        int action = output.ravel().argMax().getInt(0);

        return TrainingState.relativeAction2Move(action, snake.getLastHeadDirection());
    }
}
