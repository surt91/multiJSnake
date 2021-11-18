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
    handleNameChange: (name: string) => void,
    handleNameCommit: (name: string) => void,

    addAutopilot: (type: AiOption) => void,
    aiOptions: AiOption[],

    currentUser?: User,

}

type State = {}

class PlayerPane extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
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
                        <Button variant="outlined" onClick={_ => this.props.togglePause()}>
                            {this.props.game.paused ? "Unpause" : "Pause"}
                        </Button>
                        <Button variant="outlined" onClick={_ => this.props.reset()}>
                            Restart
                        </Button>
                    </Stack>
                </Grid>

                <Grid item xs={12}>
                    <ShareLink
                        link={this.props.shareUrl}
                    />
                </Grid>

                <Grid item xs={12}>
                    {this.props.idx >= 0 &&
                    <PlayerName
                        name={this.props.playerName}
                        color={idx2color(this.props.idx)}
                        onCommit={this.props.handleNameCommit}
                        onChange={this.props.handleNameChange}
                        loggedIn={Boolean(this.props.currentUser)}
                    />}
                </Grid>
                <Grid item xs={12}>
                    <FieldSizeSelector
                        onCommit={(width, height) => this.props.newGame(width, height)}
                        gameWidth={this.props.game.width}
                        gameHeight={this.props.game.height}
                    />
                </Grid>
                <Grid item xs={12}>
                    <AddAutopilot
                        onCommit={type => this.props.addAutopilot(type)}
                        aiOptions={this.props.aiOptions}
                        commitMode={true}
                    />
                </Grid>
            </Grid>
        )
    }
}

export default PlayerPane