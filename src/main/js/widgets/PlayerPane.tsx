import React from "react";
import {Button, Grid, Paper, Stack} from "@mui/material";
import {idx2color} from "../visualization/color";
import FieldSizeSelector from "./FieldSizeSelector";
import AddAutopilot from "./AddAutopilot";
import ShareLink from "./ShareLink";
import PlayerName from "./PlayerName";
import JsGameState from "../SnakeLogic/JsGameState";
import {User} from "./Profile";
import {AiOption} from "./Ai";

type Props = {
    game: JsGameState,
    newGame: (width: number, height: number) => void,
    togglePause: () => void,
    reset: () => void,
    shareUrl: string,

    idx: number,
    playerName: string,
    handleNameCommit: (name: string) => void,

    addAutopilot: (type: AiOption) => void,
    aiOptions: AiOption[],

    currentUser?: User,

}

export default function PlayerPane(props: Props) {
    return(
        <Grid container
              spacing={2}
              pb={2}
              direction={'column'}
              justifyContent="space-around"
              alignItems="baseline"
              component={Paper}
        >
            <Grid item xs={12}>
                <Stack direction={"row"} spacing={2}>
                    <Button variant="outlined" onClick={_ => props.togglePause()}>
                        {props.game.paused ? "Unpause" : "Pause"}
                    </Button>
                    <Button variant="outlined" onClick={_ => props.reset()}>
                        Restart
                    </Button>
                </Stack>
            </Grid>

            <Grid item xs={12}>
                <ShareLink
                    link={props.shareUrl}
                />
            </Grid>

            <Grid item xs={12}>
                {props.idx >= 0 &&
                <PlayerName
                    name={props.playerName}
                    color={idx2color(props.idx)}
                    onCommit={props.handleNameCommit}
                    loggedIn={Boolean(props.currentUser)}
                />}
            </Grid>
            <Grid item xs={12}>
                <FieldSizeSelector
                    onCommit={(width, height) => props.newGame(width, height)}
                    gameWidth={props.game.width}
                    gameHeight={props.game.height}
                />
            </Grid>
            <Grid item xs={12}>
                <AddAutopilot
                    onCommit={type => props.addAutopilot(type)}
                    aiOptions={props.aiOptions}
                    commitMode={true}
                />
            </Grid>
        </Grid>
    )
}
