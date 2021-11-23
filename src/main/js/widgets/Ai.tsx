import React from "react";
import Canvas from "../visualization/canvas";
import {draw} from "../visualization/canvasDraw";
import {Container, Grid, Stack, Box, Typography} from "@mui/material";
import * as tf from "@tensorflow/tfjs";
// @ts-ignore
import jsYaml from "js-yaml";

import JsGameState from "../SnakeLogic/JsGameState";
import AddAutopilot from "./AddAutopilot";
// @ts-ignore
import rawAiOptions from "../../resources/models/strategies.yaml"
import FieldSizeSelector from "./FieldSizeSelector";
import {LayersModel} from "@tensorflow/tfjs";
import { stat } from "fs";

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
    scale: number,
    bgColor: string,
    foodColor: string,
    game: JsGameState,
    currentModel: AiOption,
    blurred: boolean,
    scores: number[]
};

class Ai extends React.Component<Props, State> {
    private readonly aiJsOptions: AiOption[];
    private model_promise: Promise<LayersModel> | null;
    private refresh?: number;

    constructor(props: Props) {
        super(props);

        const aiJsOptionsAll = jsYaml.load(rawAiOptions);
        const aiJsOptions = aiJsOptionsAll.filter((obj: AiOption) => "model_path_js" in obj);

        this.aiJsOptions = aiJsOptions;

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: new JsGameState(10, 10, (score) => this.appendScore(score)),
            currentModel: aiJsOptions[aiJsOptions.length - 1],
            blurred: false,
            scores: []
        };

        this.model_promise = null;
    }

    componentDidMount() {
        this.setAi(this.state.currentModel)
        this.refresh = window.setInterval(() => this.step(), 30);
    }

    componentWillUnmount() {
        this.refresh && window.clearInterval(this.refresh);
    }

    newGame(width: number, height: number) {
        const game = new JsGameState(width, height, (score) => this.appendScore(score));
        this.setState({game: game});
    }

    setAi(obj: AiOption) {
        this.setState({currentModel: obj});
        this.model_promise = tf.loadLayersModel(obj.model_path_js);
    }

    appendScore(score: number) {
        this.setState(state => ({scores: [...state.scores, score]}));
    }

    step() {
        this.model_promise && this.model_promise.then(model => {
            if(this.state.currentModel.input === "global") {
                const state = tf.tensor([this.state.game.trainingBitmap()]);
                const out = model.predict(state);
                state.dispose();
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                this.state.game.absoluteAction2Move(action);
            } else {
                const state = tf.tensor([this.state.game.trainingState()]);
                const out = model.predict(state);
                state.dispose();
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                this.state.game.relativeAction2Move(action);
            }
            this.state.game.update();

            this.setState({game: this.state.game});
        });
    }

    render() {
        const options = {
            scale: this.state.scale,
            bgColor: this.state.bgColor,
            foodColor: this.state.foodColor,
            blurred: this.state.blurred
        }

        const scoreElements = this.state.scores.map((score, idx) => <li key={idx}>{score}</li>)

        return (
            <Container maxWidth="lg">
                <Grid container spacing={4} pt={4} justifyContent="space-around" alignItems="flex-start">
                    <Grid item xs={12} lg={6}>
                        <Canvas
                            draw={ctx => draw(ctx, this.state.game, options)}
                            width={this.state.game.width * this.state.scale}
                            height={this.state.game.height * this.state.scale}
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
                            <Box>
                                <Typography variant="h6">
                                    Last Scores
                                </Typography>
                                <ul>
                                    {scoreElements}
                                </ul>
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        )
    }
}


export default Ai
