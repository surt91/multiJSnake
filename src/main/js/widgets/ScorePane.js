import React from "react";
import {idx2color} from "../visualization/color";
import {Grid, Paper} from "@mui/material";
import Scores from "./Scores";

class ScorePane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const scores = Object.values(this.props.game.snakes).map(snake => {
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
                        title={`Highscores for ${this.props.game.width} x ${this.props.game.height}`}
                        scores={this.props.highscores}
                    />
                </Grid>
                <Grid item>
                    <Scores
                        key="Highscores"
                        title="Highscores"
                        scores={this.props.globalHighscores}
                    />
                </Grid>
            </Grid>
        );
    }
}

export default ScorePane