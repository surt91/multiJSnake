package me.schawe.multijsnake.snake.ai;

public class AutopilotDescription {
    String id;
    String model_path;
    String label;
    String description;
    String input;
    String mode;

    AutopilotDescription(String id, String model_path, String input, String mode, String label, String description) {
        this.id = id;
        this.model_path = model_path;
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
                ", model_path='" + model_path + '\'' +
                ", label='" + label + '\'' +
                ", description='" + description + '\'' +
                ", input='" + input + '\'' +
                ", mode='" + mode + '\'' +
                '}';
    }
}
