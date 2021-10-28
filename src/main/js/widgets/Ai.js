import React from "react";
import Canvas from "../visualization/canvas";
import {draw} from "../visualization/canvasDraw";
import {Container, Grid, Stack} from "@mui/material";
import * as tf from "@tensorflow/tfjs";
import jsYaml from "js-yaml";

import JsGameState from "../SnakeLogic/JsGameState";
import AddAutopilot from "./AddAutopilot";
import rawAiOptions from "../../resources/models/strategies.yaml"

class Ai extends React.Component {

    constructor(props) {
        super(props);

        const aiJsOptionsAll = jsYaml.load(rawAiOptions);
        const aiJsOptions = aiJsOptionsAll.filter(obj => "model_path_js" in obj);

        this.aiJsOptions = aiJsOptions;

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: new JsGameState(10, 10),
            currentModel: aiJsOptions[aiJsOptions.length - 1]
        };

        this.model_promise = null;
    }

    componentDidMount() {
        this.setAi(this.state.currentModel)
        this.refresh = setInterval(_ => this.step(), 30);
    }

    componentWillUnmount() {
        clearInterval(this.refresh);
    }

    newGame(width, height) {
        const game = new JsGameState(width, height);
        this.setState({game: game});
    }

    setAi(obj) {
        this.setState({currentModel: obj});
        this.model_promise = tf.loadLayersModel(obj.model_path_js);
    }

    step() {
        this.model_promise.then(model => {
            if(this.state.currentModel.input === "global") {
                let action = model.predict(tf.tensor([this.state.game.trainingBitmap()]));
                action = action[0].argMax(1).arraySync()[0];
                this.state.game.absoluteAction2Move(action);
            } else {
                let action = model.predict(tf.tensor([this.state.game.trainingState()]));
                action = action[0].argMax(1).arraySync()[0];
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
                        <AddAutopilot
                            onCommit={id => this.setAi(id)}
                            onChange={id => this.setAi(id)}
                            aiOptions={this.aiJsOptions}
                            submitText={"Change AI"}
                            width={500}
                        defaultValue={this.state.currentModel}
                            commitMode={false}
                        />
                    </Grid>
                </Grid>
            </Container>
        )
    }
}


export default Ai
