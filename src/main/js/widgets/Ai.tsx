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

type Model = {
    options: AiOption
    model: LayersModel|undefined
}

export default function Ai() {
    // load all models from the yaml ...
    const aiJsOptionsAll = jsYaml.load(rawAiOptions);
    // ... but only offer those, which have a model in the correct format
    const aiJsOptions: AiOption[] = aiJsOptionsAll.filter((obj: AiOption) => "model_path_js" in obj);

    const visOpts = defaultVisualizationOptions;

    // game is a mutable object, it will mutate itself and will not trigger re-rendering
    const [game, ] = useState(new JsGameState(10, 10, (score) => gameOver(score)));
    const [model, setModel] = useState<Model>({
        options: aiJsOptions[aiJsOptions.length - 1],
        model: undefined
    });
    const canvasRef = useRef<HTMLCanvasElement|null>(null);

    // TODO: can we even buffer a few results?
    function* predictionGenerator() {
        if(model.model === undefined) {
            return
        }

        while(true) {
            engine().startScope()
            if (model.options.input === "global") {
                const state = tensor([game.trainingBitmap()]);
                const out = model.model.predict(state);
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                yield game.absoluteAction(action);
            } else {
                const state = tensor([game.trainingState()]);
                const out = model.model.predict(state);
                // @ts-ignore
                const action = out[0].argMax(1).arraySync()[0];
                yield game.relativeAction(action);
            }
            engine().endScope();
        }
    }

    useEffect(() => {
        // if we do not have a model, we don't need to try to step
        if(model.model === undefined) {
            return
        }

        const predictionGeneratorObject = predictionGenerator();
        const refresh = window.setInterval(() => step(predictionGeneratorObject), 30);

        draw(getContext(), game, visOpts)

        return () => {
            window.clearInterval(refresh);
            predictionGeneratorObject.return()
        };
    })

    useEffect(() => {
        loadLayersModel(model.options.model_path_js).then(m => setModel(prevState => {
            // if there is an old model, dispose it first
            prevState.model && prevState.model.layers.forEach(l => l.dispose());
            return {options: model.options, model: m};
        }));
    }, [model.options])

    // function newGame(width: number, height: number) {
    //     const game = new JsGameState(width, height, (score) => gameOver(score));
    //     setGame(game);
    // }

    function step(predictionGenerator: Generator<"up" | "down" | "left" | "right">) {
        if(model.model === undefined) {
            return
        }

        const nextDirection = predictionGenerator.next();
        game.setHeadDirection(nextDirection.value);
        game.update();

        draw(getContext(), game, visOpts);
    }

    function getContext(): CanvasRenderingContext2D {
        const canvas = canvasRef.current;
        if(canvas === null) {
            throw "Canvas failed to construct";
        }
        const context = canvas.getContext('2d');
        if(context === null) {
            throw "Failed to get the Context of the constructed canvas";
        }
        return context;
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
                            onCommit={obj => setModel({options: obj, model: undefined})}
                            onChange={obj => setModel({options: obj, model: undefined})}
                            aiOptions={aiJsOptions}
                            submitText={"Change AI"}
                            width={"100%"}
                            defaultValue={model.options}
                            commitMode={false}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    )
}