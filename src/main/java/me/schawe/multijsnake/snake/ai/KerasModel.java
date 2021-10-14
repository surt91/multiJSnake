package me.schawe.multijsnake.snake.ai;

import me.schawe.multijsnake.snake.GameState;
import me.schawe.multijsnake.snake.Move;
import me.schawe.multijsnake.snake.Snake;
import org.deeplearning4j.nn.modelimport.keras.KerasModelImport;
import org.deeplearning4j.nn.modelimport.keras.exceptions.InvalidKerasConfigurationException;
import org.deeplearning4j.nn.modelimport.keras.exceptions.UnsupportedKerasConfigurationException;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Random;

// https://deeplearning4j.konduit.ai/deeplearning4j/how-to-guides/keras-import
public class KerasModel implements Autopilot {
    MultiLayerNetwork model;

    public KerasModel(String pathToModel) {
        // load model
        try {
            String simpleMlp = new ClassPathResource(pathToModel).getFile().getPath();
            model = KerasModelImport.importKerasSequentialModelAndWeights(simpleMlp);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (UnsupportedKerasConfigurationException e) {
            e.printStackTrace();
        } catch (InvalidKerasConfigurationException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Move suggest(GameState gameState, Snake snake) {
        // infer
        var state = gameState.trainingState(snake.getIdx());
        INDArray input = Nd4j.create(state).reshape(1, state.size());
        INDArray output = model.output(input);

        int action = output.ravel().argMax().getInt(0);

        Move next;
        switch (action) {
            case 0:
                next = snake.headDirection.rLeft();
                break;
            case 1:
                next = snake.headDirection.straight();
                break;
            case 2:
                next = snake.headDirection.rRight();
                break;
            default:
                throw new RuntimeException("unreachable!");
        }

        return next;
    }

    @Override
    public String generateName() {
        String[] names = {
                "Cylex", "Nanex", "Voltra", "Ionus", "Hydrex", "Vertron", "Polybit", "Cubicub",
                "Toroidus", "Icosidon", "Maniflex", "Multiplus", "Cebrenus", "Tribon", "Ozonex", "Nitron",
                "Mechus", "Protus", "Omnius", "Trion", "Omicron", "Ultrus", "Isotoxon", "Xubix", "Cybrus",
                "Cybroid", "Machinus", "Prismus", "Robonus", "Integron", "Tessellon", "Protron", "Strobus",
                "Mechanex", "Zoplex", "Retrion", "Cyphorex", "Robex", "Robitron", "Combinus", "Arcus",
                "Fluxitron", "Magnetron", "Positrex", "Negabit", "Antiplex", "Technus", "Synthon", "Datus",
                "Maxus", "Gyricon", "Nega", "Lazerex", "Radex", "Radion", "Teslus", "Voxus", "Voxon",
                "Plexon", "Itron", "Techron", "Extron", "Terminex", "Valicron", "Quatron", "Helixon", "Leptonex",
                "Nucleux", "Cybro", "Solaron", "Spectron", "Enertron", "Kaonus", "Negitron", "Atomiton",
                "Positrus", "Symmetrus", "Qubex"
        };

        Random random = new Random();
        int r = random.nextInt(names.length);
        return names[r];
    }
}
