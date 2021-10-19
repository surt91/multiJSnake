package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;

public class LocalDeepAutopilot extends KerasModel{

    public LocalDeepAutopilot(String pathToModel, boolean isFunctional) {
        super(pathToModel, isFunctional);
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        // infer
        var state = gameState.trainingState(snake.getIdx());
        INDArray input = Nd4j.create(state).reshape(1, state.size());

        INDArray output;
        if(modelSequential != null) {
            output = modelSequential.output(input);
        } else if(modelFunctional != null) {
            output = modelFunctional.output(input)[0];
        } else {
            gameState.kill(snake.getIdx());
            throw new RuntimeException("failed to load model `" + pathToModel + "`");
        }

        int action = output.ravel().argMax().getInt(0);

        return gameState.relativeAction2Move(action, snake.lastHeadDirection);
    }
}
