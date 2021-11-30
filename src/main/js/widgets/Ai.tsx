import React from "react";
import Canvas from "../visualization/canvas";
import {defaultVisualizationOptions, draw} from "../visualization/canvasDraw";
import {Container, Grid, Stack} from "@mui/material";
// @ts-ignore
import jsYaml from "js-yaml";
// @ts-ignore
import rawAiOptions from "../../resources/models/strategies.yaml"
import JsGameState from "../SnakeLogic/JsGameState";
import AddAutopilot from "./AddAutopilot";
// import FieldSizeSelector from "./FieldSizeSelector";
// import tensorflow dynamically (in a separate chuck thanks to webpack), since it is large and only needed for one route
const {tensor, loadLayersModel, engine} = await import("@tensorflow/tfjs");
// this one is just for the type and is hopefully dead-code-eliminated from the bundle
import {LayersModel} from "@tensorflow/tfjs";

export type AiOption = {
    id: string,
    label: string,
    description: string,
    model_path_js: string,
    input: string,
    mode: string
}
type Props = {};
type State = {
    game: JsGameState,
    currentModel: AiOption
};

export default class Ai extends React.Component<Props, State> {
    private readonly aiJsOptions: AiOption[];
    private model_promise: Promise<LayersModel> | null;
    private refresh?: number;

    constructor(props: Props) {
        super(props);

        const aiJsOptionsAll = jsYaml.load(rawAiOptions);
        const aiJsOptions = aiJsOptionsAll.filter((obj: AiOption) => "model_path_js" in obj);

        this.aiJsOptions = aiJsOptions;

        this.state = {
            game: new JsGameState(10, 10, (score) => this.gameOver(score)),
            currentModel: aiJsOptions[aiJsOptions.length - 1]
        };

        this.model_promise = null;
    }

    componentDidMount() {
        this.setAi(this.state.currentModel)
        this.refresh = window.setInterval(() => this.step(), 30);
    }

    componentWillUnmount() {
        this.refresh && window.clearInterval(this.refresh);
        this.freeModel();
    }

    newGame(width: number, height: number) {
        const game = new JsGameState(width, height, (score) => this.gameOver(score));
        this.setState({game: game});
    }

    freeModel(){
        this.model_promise && this.model_promise.then(model => model.layers.forEach(l => l.dispose()));
    };

    setAi(obj: AiOption) {
        this.setState({currentModel: obj});
        // if there is an old model, dispose it first
        this.freeModel();
        this.model_promise = loadLayersModel(obj.model_path_js);
    }

    gameOver(score: number) {
        console.log(score);
    }

    step() {
        this.model_promise && this.model_promise.then(model => {
            engine().startScope()

            if(this.state.currentModel.input === "global") {
                const state = tensor([this.state.game.trainingBitmap()]);
                const out = model.predict(state);
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                this.state.game.absoluteAction2Move(action);
            } else {
                const state = tensor([this.state.game.trainingState()]);
                const out = model.predict(state);
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                this.state.game.relativeAction2Move(action);
            }
            engine().endScope();

            this.state.game.update();

            this.setState({game: this.state.game});
        });
    }

    render() {
        const options = defaultVisualizationOptions;

        return (
            <Container maxWidth="lg">
                <Grid container spacing={4} pt={4} justifyContent="space-around" alignItems="flex-start">
                    <Grid item xs={12} lg={6}>
                        <Canvas
                            draw={ctx => draw(ctx, this.state.game, options)}
                            width={this.state.game.width * options.scale}
                            height={this.state.game.height * options.scale}
                            sx={{ mx: "auto" }}
                            focused={_ => {}}
                        />
                    </Grid>
                    <Grid item xs={12} lg={6}>
                        <Stack spacing={2}>
                            <AddAutopilot
                                onCommit={id => this.setAi(id)}
                                onChange={id => this.setAi(id)}
                                aiOptions={this.aiJsOptions}
                                submitText={"Change AI"}
                                width={500}
                                defaultValue={this.state.currentModel}
                                commitMode={false}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        )
    }
}
