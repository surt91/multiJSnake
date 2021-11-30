import React, {useEffect, useRef, useState} from "react";
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

export default function Ai() {
    const aiJsOptionsAll = jsYaml.load(rawAiOptions);
    const aiJsOptions: AiOption[] = aiJsOptionsAll.filter((obj: AiOption) => "model_path_js" in obj);

    const visOpts = defaultVisualizationOptions;

    const [game, setGame] = useState(new JsGameState(10, 10, (score) => gameOver(score)))
    const [modelOption, setModelOption] = useState(aiJsOptions[aiJsOptions.length - 1]);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);

    let model_promise: Promise<LayersModel> | null = null;

    useEffect(() => {
        setAi(modelOption);
        const refresh = window.setInterval(() => step(), 30);

        const canvas = canvasRef.current;
        if(canvas === null) {
            throw "Canvas failed to construct";
        }
        const contextTest = canvas.getContext('2d');
        if(contextTest === null) {
            throw "Failed to get the Context of the constructed canvas";
        }
        const context: CanvasRenderingContext2D = contextTest;

        function step() {
            model_promise && model_promise.then(model => {
                engine().startScope()

                if(modelOption.input === "global") {
                    const state = tensor([game.trainingBitmap()]);
                    const out = model.predict(state);
                    // @ts-ignore
                    const action = out[0].argMax(1).arraySync()[0];
                    game.absoluteAction2Move(action);
                } else {
                    const state = tensor([game.trainingState()]);
                    const out = model.predict(state);
                    // @ts-ignore
                    const action = out[0].argMax(1).arraySync()[0];
                    game.relativeAction2Move(action);
                }
                engine().endScope();

                game.update();

                setGame(game);

                draw(context, game, visOpts)
            });
        }

        return () => {
            window.clearInterval(refresh);
            freeModel();
        };
    })

    // function newGame(width: number, height: number) {
    //     const game = new JsGameState(width, height, (score) => gameOver(score));
    //     setGame(game);
    // }

    function freeModel(){
        model_promise && model_promise.then(model => model.layers.forEach(l => l.dispose()));
    }

    function setAi(obj: AiOption) {
        setModelOption(obj);
        // if there is an old model, dispose it first
        freeModel();
        model_promise = loadLayersModel(obj.model_path_js);
    }

    function gameOver(score: number) {
        console.log(score)
    }

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4} pt={4} justifyContent="space-around" alignItems="flex-start">
                <Grid item xs={12} lg={6}>
                    <canvas
                        ref={canvasRef}
                        width={game.width * visOpts.scale}
                        height={game.height * visOpts.scale}
                        id={"snakeCanvas"}
                    />
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Stack spacing={2}>
                        <AddAutopilot
                            onCommit={id => setAi(id)}
                            onChange={id => setAi(id)}
                            aiOptions={aiJsOptions}
                            submitText={"Change AI"}
                            width={500}
                            defaultValue={modelOption}
                            commitMode={false}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    )
}