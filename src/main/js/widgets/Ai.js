import React from "react";
import Canvas from "../visualization/canvas";
import {draw} from "../visualization/canvasDraw";
import {Container, Grid, Stack} from "@mui/material";
import * as tf from "@tensorflow/tfjs";

import JsGameState from "../SnakeLogic/JsGameState";
import AddAutopilot from "./AddAutopilot";

class Ai extends React.Component {

    constructor(props) {
        super(props);

        let dense_desc = "A deep, fully connected network -- but in this case `deep` only means one hidden layer. " +
            "The input is just the local area around the head of the snake and the direction of the food. "
        let conv_desc = "A deep convolutional neural network, which takes the whole field as input. " +
            "The field is split in three layers: the tail, the head and the food. "
        let a2c_desc =
            "The model uses the Advantage Actor-Critic (A2C) approach. The neural network " +
            "branches in the last layer: One branch is the actor, it suggests the next step to " +
            "take (up, down, left, right). The other branch is the critic, it estimates the quality " +
            "of the current state, i.e., how many points the snakes will be able to collect in the future. ";

        this.aiJsOptions = [
            {
                path: "models/AC_e100/model.json",
                label: "local A2C N=100",
                input: "local",
                description: dense_desc + a2c_desc +
                    "The model was trained by playing 100 games."
            },
            {
                path: "models/AC_e300/model.json",
                label: "local A2C N=300",
                input: "local",
                description: dense_desc + a2c_desc +
                    "The model was trained by playing 300 games."
            },
            {
                path: "models/AC_e600/model.json",
                label: "local A2C N=600",
                input: "local",
                description: dense_desc + a2c_desc +
                    "The model was trained by playing 600 games."
            },
            {
                path: "models/AC_e1000/model.json",
                label: "local A2C N=1000",
                input: "local",
                description: dense_desc + a2c_desc +
                    "The model was trained by playing 1000 games."
            },
            {
                path: "models/AC_e36000/model.json",
                label: "local A2C N=36000",
                input: "local",
                description: dense_desc + a2c_desc +
                    "The model was trained by playing 36.000 games."
            },
            {
                path: "models/convAC_4000/model.json",
                label: "convolutional A2C N=4000",
                input: "global",
                description: conv_desc + a2c_desc +
                    "The model was trained by playing 4.000 games."
            },
            {
                path: "models/convAC_10000/model.json",
                label: "convolutional A2C N=10000",
                input: "global",
                description: conv_desc + a2c_desc +
                    "The model was trained by playing 10.000 games."
            },
            {
                path: "models/snakeConvA2C_e29000/model.json",
                label: "convolutional A2C N=29000",
                input: "global",
                description: conv_desc + a2c_desc +
                    "The model was trained by playing 29.000 games."
            },
            {
                path: "models/snakeConvA2C_e50000/model.json",
                label: "convolutional A2C N=50000",
                input: "global",
                description: conv_desc + a2c_desc +
                    "The model was trained by playing 50.000 games."
            }
        ]

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: new JsGameState(10, 10),
            currentModel: this.aiJsOptions[this.aiJsOptions.length - 1]
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
        this.model_promise = tf.loadLayersModel(obj.path);
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
                            defaultValue={this.aiJsOptions[0]}
                            commitMode={false}
                        />
                    </Grid>
                </Grid>
            </Container>
        )
    }
}


export default Ai
