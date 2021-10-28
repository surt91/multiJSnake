package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;
import org.nd4j.common.util.ArrayUtil;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;

import java.util.Arrays;
import java.util.stream.Collectors;

public class GlobalDeepAutopilot extends KerasModel{

    public GlobalDeepAutopilot(String pathToModel, boolean isFunctional) {
        super(pathToModel, isFunctional);
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        // infer
        int[][][] state = gameState.trainingBitmap(snake.getIdx());
        // this should work, but somehow does not work
        // INDArray input = Nd4j.create(state);
        
        // therefore, I need this workaround
        var flat = Arrays.stream(ArrayUtil.flatten(state)).boxed().collect(Collectors.toList());
        INDArray input = Nd4j.create(flat).reshape(1, state.length, state[0].length, state[0][0].length);

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

        return gameState.absoluteAction2Move(action);
    }
}
