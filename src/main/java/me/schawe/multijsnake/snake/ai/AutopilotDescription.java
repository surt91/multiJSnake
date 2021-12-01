package me.schawe.multijsnake.snake.ai;

public class AutopilotDescription {
    private final String id;
    private final String modelPath;
    private final String label;
    private final String description;
    private final String input;
    private final String mode;

    public AutopilotDescription(String id, String modelPath, String input, String mode, String label, String description) {
        this.id = id;
        this.modelPath = modelPath;
        this.input = input;
        this.mode = mode;
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public String getId() {
        return id;
    }

    @Override
    public String toString() {
        return "AutopilotDescription{" +
                "id='" + id + '\'' +
                ", model_path='" + modelPath + '\'' +
                ", label='" + label + '\'' +
                ", description='" + description + '\'' +
                ", input='" + input + '\'' +
                ", mode='" + mode + '\'' +
                '}';
    }

    public String getModelPath() {
        return modelPath;
    }

    public String getInput() {
        return input;
    }

    public String getMode() {
        return mode;
    }
}
