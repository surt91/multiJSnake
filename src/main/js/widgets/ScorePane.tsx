import React from "react";
import {idx2color} from "../visualization/color";
import {Grid, Paper} from "@mui/material";
import Scores, {Score} from "./Scores";
import JsGameState from "../SnakeLogic/JsGameState";

type Props = {
    game: JsGameState,
    highscores: Score[],
    globalHighscores: Score[]
}

export default function ScorePane(props: Props) {

    const scores = Object.values(props.game.snakes).map(snake => {
        return {
            idx: snake.idx,
            playerName: snake.name,
            score: snake.length,
            color: idx2color(snake.idx)
        }
    })

    return(
        <Grid container
              spacing={2}
              pb={2}
              direction={'column'}
              justifyContent="space-around"
              alignItems="baseline"
              component={Paper}
        >
            <Grid item>
                <Scores
                    key="Scores"
                    title="Scores"
                    scores={scores}
                />
            </Grid>
            <Grid item>
                <Scores
                    key="highscoresSize"
                    title={`Highscores for ${props.game.width} x ${props.game.height}`}
                    scores={props.highscores}
                />
            </Grid>
            <Grid item>
                <Scores
                    key="Highscores"
                    title="Highscores"
                    scores={props.globalHighscores}
                />
            </Grid>
        </Grid>
    );
}
