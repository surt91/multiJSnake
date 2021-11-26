package me.schawe.multijsnake.snake.ai;

import org.deeplearning4j.nn.graph.ComputationGraph;
import org.deeplearning4j.nn.modelimport.keras.KerasModelImport;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.nd4j.common.io.ClassPathResource;

import java.util.Random;

// https://deeplearning4j.konduit.ai/deeplearning4j/how-to-guides/keras-import
public abstract class KerasModel implements Autopilot {
    protected final ComputationGraph modelFunctional;
    protected final MultiLayerNetwork modelSequential;
    protected final String pathToModel;

    public KerasModel(String pathToModel, boolean isFunctional) {
        this.pathToModel = pathToModel;

        // load model
        if(isFunctional) {
            try {
                String savedModel = new ClassPathResource(pathToModel).getFile().getPath();
                modelFunctional = KerasModelImport.importKerasModelAndWeights(savedModel, false);
                modelSequential = null;
            } catch (Exception e) {
                throw new AutopilotException("failed loading a functional keras model: '" + pathToModel + "'");
            }
        } else {
            try {
                String savedModel = new ClassPathResource(pathToModel).getFile().getPath();
                modelSequential = KerasModelImport.importKerasSequentialModelAndWeights(savedModel, false);
                modelFunctional = null;
            } catch (Exception e) {
                throw new AutopilotException("failed loading a sequential keras model: '" + pathToModel + "'");
            }
        }
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
                "Maxus", "Gyricon", "Lazerex", "Radex", "Radion", "Teslus", "Voxus", "Voxon",
                "Plexon", "Itron", "Techron", "Extron", "Terminex", "Valicron", "Quatron", "Helixon", "Leptonex",
                "Nucleux", "Cybro", "Solaron", "Spectron", "Enertron", "Kaonus", "Negitron", "Atomiton",
                "Positrus", "Symmetrus", "Qubex"
        };

        Random random = new Random();
        int r = random.nextInt(names.length);
        return names[r];
    }
}
