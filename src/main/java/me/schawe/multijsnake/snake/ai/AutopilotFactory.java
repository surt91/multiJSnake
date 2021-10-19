package me.schawe.multijsnake.snake.ai;

import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

public class AutopilotFactory {
    Map<String, AutopilotDescription> autopilots;

    public AutopilotFactory() {
        autopilots = listAutopilots();
    }

    public Autopilot build(String id) {
        AutopilotDescription desc = autopilots.get(id);

        Autopilot autopilot;
        if(Objects.equals(desc.model_path, "greedy")) {
            autopilot = new GreedyAutopilot();
        } else if (desc.model_path.startsWith("models/func/")) {
            autopilot = new LocalDeepAutopilot(desc.model_path, true);
        } else if (desc.model_path.startsWith("models/seq/")) {
            autopilot = new LocalDeepAutopilot(desc.model_path, false);
        } else if (desc.model_path.startsWith("models/global/func/")) {
            autopilot = new GlobalDeepAutopilot(desc.model_path, true);
        } else {
            autopilot = new RandomAutopilot();
        }

        return autopilot;
    }

    private static Map<String, AutopilotDescription> listAutopilots() {
        Yaml yaml = new Yaml();
        InputStream inputStream = AutopilotFactory.class
                .getClassLoader()
                .getResourceAsStream("models/strategies.yaml");
        Map<String, Map<String, String>> obj = yaml.load(inputStream);

        LinkedHashMap<String, AutopilotDescription> out = new LinkedHashMap<>();

        for (Map.Entry<String, Map<String, String>> entry : obj.entrySet()) {
            String key = entry.getKey();
            Map<String, String> value = entry.getValue();

            out.put(key, new AutopilotDescription(key, value.get("model_path"), value.get("name"), value.get("description")));
        }
        
        return out;
    }

    public Map<String, AutopilotDescription> getAutopilots() {
        return autopilots;
    }
}
