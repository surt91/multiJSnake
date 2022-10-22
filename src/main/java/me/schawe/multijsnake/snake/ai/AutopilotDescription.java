package me.schawe.multijsnake.snake.ai;

public record AutopilotDescription(String id, String modelPath, String input, String mode, String label, String description) {

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
}
