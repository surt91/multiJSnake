import React from "react";
import Canvas from "./visualization/canvas";
import {draw} from "./visualization/canvasDraw";
import {Container, Grid} from "@mui/material";
import * as tf from "@tensorflow/tfjs";

import JsGameState from "./SnakeLogic/JsGameState";
import AddAutopilot from "./AddAutopilot";

class Ai extends React.Component {

    constructor(props) {
        super(props);

        const game = new JsGameState(10, 10);

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: game
        };

        this.model_promise = null;

        let convA2C_desc = "A convolutional neural network, which takes the whole field as input. " +
            "The field is split in three layers: the tail, the head and the food. " +
            "The model uses the Advantage Actor-Critic (A2C) approach. We use a deep convolutional " +
            "network which branches in the last layer. One branch is the actor, it predicts the " +
            "next step to take (up, down, left, right). The other branch is the critic, it predicts " +
            "the quality of the taken moves, i.e., how many points the snakes will likely still collect. ";

        this.aiJsOptions = [
            {
                id: "models/snakeConvA2C_e27000/model.json",
                label: "convolutional A2C N=27000",
                description: convA2C_desc +
                    "The model was trained by playing 27.000 games."
            }

        ]
    }

    componentDidMount() {
        this.setAi('models/snakeConvA2C_e27000/model.json')
        this.refresh = setInterval(_ => this.step(), 30);
    }

    componentWillUnmount() {
        clearInterval(this.refresh);
    }

    setAi(path) {
        console.log(path);
        this.model_promise = tf.loadLayersModel(path);
    }

    step() {
        this.model_promise.then(model => {
            let action = model.predict(tf.tensor([this.state.game.trainingBitmap()]));
            action = action[0].argMax(1).arraySync()[0];
            this.state.game.absoluteAction2Move(action);
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
                            aiOptions={this.aiJsOptions}
                            submitText={"Change AI"}
                            width={500}
                            defaultValue={this.aiJsOptions[0]}
                        />
                    </Grid>
                </Grid>
            </Container>
        )
    }
}


export default Ai
