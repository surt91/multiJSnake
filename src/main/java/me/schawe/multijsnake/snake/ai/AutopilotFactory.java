package me.schawe.multijsnake.snake.ai;

import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class AutopilotFactory {
    // TODO: add a method to register new autopilot classes

    private final Map<String, AutopilotDescription> autopilots;

    public AutopilotFactory() {
        autopilots = listAutopilots();
    }

    public Autopilot build(String id) {
        AutopilotDescription desc = autopilots.get(id);

        Autopilot autopilot;
        if(Objects.equals(desc.getModelPath(), "greedy")) {
            autopilot = new GreedyAutopilot();
        } else if(Objects.equals(desc.getModelPath(), "random")) {
            autopilot = new RandomAutopilot();
        } else if (desc.getInput().equals("local")) {
            autopilot = new LocalDeepAutopilot(desc.getModelPath(), desc.getMode().equals("functional"));
        } else if (desc.getInput().equals("global")) {
            autopilot = new GlobalDeepAutopilot(desc.getModelPath(), desc.getMode().equals("functional"));
        } else {
            // TODO: handle the unexpected input
            autopilot = new RandomAutopilot();
        }

        return autopilot;
    }

    private static Map<String, AutopilotDescription> listAutopilots() {
        Yaml yaml = new Yaml();
        InputStream inputStream = AutopilotFactory.class
                .getClassLoader()
                .getResourceAsStream("models/strategies.yaml");
        List<Map<String, String>> array = yaml.load(inputStream);

        LinkedHashMap<String, AutopilotDescription> out = new LinkedHashMap<>();

        for (Map<String, String> obj : array) {

            var desc = new AutopilotDescription(
                    obj.get("id"),
                    obj.get("model_path_java"),
                    obj.get("input"),
                    obj.get("mode"),
                    obj.get("label"),
                    obj.get("description")
            );
            out.put(obj.get("id"), desc);
        }
        
        return out;
    }

    public Map<String, AutopilotDescription> getAutopilots() {
        return autopilots;
    }
}
