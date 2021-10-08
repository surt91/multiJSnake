import React from "react";
import {registerTouch} from "./registerTouch";
import {registerStompPromise} from "./websocket-listener";
import {
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    Paper, Table, TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField, Tooltip
} from "@material-ui/core";
import Canvas from "./canvas";
import {draw} from "./canvasDraw";
import DoneIcon from "@material-ui/icons/Done";
import RevertIcon from "@material-ui/icons/NotInterestedOutlined";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import PropTypes from "prop-types";
import {idx2color} from "./color";

export class GameView extends React.Component {

    constructor(props) {
        super(props);

        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        this.id = params["id"];

        if (this.id) {
            // also remove the query string with the id, without reloading
            // https://stackoverflow.com/a/19279428
            const withoutQuery = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path: withoutQuery}, '', withoutQuery);
        }

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: {
                width: 20,
                height: 20,
                food: {x: -1, y: -1},
                snakes: [],
            },
            highscores: [],
            globalHighscores: [],
            idx: -1,
            blurred: false,
            playerName: "",
            shareUrl: ""
        };

        this.updateGameState = this.updateGameState.bind(this);
        this.updateHighscore = this.updateHighscore.bind(this);
        this.updateGlobalHighscore = this.updateGlobalHighscore.bind(this);
        this.updateIdentity = this.updateIdentity.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleNameCommit = this.handleNameCommit.bind(this);
    }

    componentDidMount() {
        this.init(this.state.game.width, this.state.game.height);
        registerTouch(dir => this.move(dir), _ => this.unpause());
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentUser && prevProps.currentUser !== this.props.currentUser) {
            this.handleNameCommit(this.props.currentUser.username)
        }
    }

    newGame(w, h) {
        this.id = undefined;
        this.init(w, h);
    }

    init(w, h) {
        // check if we are joining an existing game, or starting a new one
        // https://stackoverflow.com/a/901144

        if(this.id === undefined) {
            fetch(`/api/init/${w}/${h}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => response.json())
                .then((x) => {
                    this.id = x.id;
                    this.join(this.id);
                });
        } else {
            this.join(this.id);
        }
    }

    join(id) {
        if (id === undefined) {
            // TODO: raise an error
            return;
        }

        const url = window.location.origin + `?id=${id}`;

        this.setState({
            shareUrl: url,
            id: id
        });

        if(this.stompClientPromise !== undefined) {
            // if we are already joined to a game, disconnect the existing
            // client before joining with a new one
            this.stompClientPromise.then(x => x.unsubscribeAll());
        }

        this.stompClientPromise = registerStompPromise([
            {route: '/topic/update/' + id, callback: this.updateGameState},
            {route: '/topic/newHighscore', callback: this.updateHighscore},
            {route: '/topic/newGlobalHighscore', callback: this.updateGlobalHighscore},
            {route: '/user/queue/getIdx', callback: this.updateIdentity},
        ]).then(x => {
            x.send("/app/join", {}, id);
            return x;
        });
    }

    move(dir) {
        this.stompClientPromise.then(x => x.send("/app/move", {}, JSON.stringify(dir)));
    }

    reset() {
        this.stompClientPromise.then(x => x.send("/app/reset", {}, ""));
    }

    unpause() {
        if(this.state.game.paused) {
            this.stompClientPromise.then(x => x.send("/app/unpause", {}, ""));
        }
    }

    pause() {
        if(!this.state.game.paused) {
            this.stompClientPromise.then(x => x.send("/app/pause", {}, ""));
        }
    }

    togglePause() {
        if(this.state.game.paused) {
            this.unpause();
        } else {
            this.pause();
        }
    }

    updateGameState(message) {
        const gameState = JSON.parse(message.body);
        this.setState({
            game: gameState
        });
    }

    updateHighscore(message) {
        if(message === undefined) {
            return;
        }

        const highscores = JSON.parse(message.body);
        this.setState({highscores: highscores});
    }

    updateGlobalHighscore(message) {
        if(message === undefined) {
            return;
        }

        const highscores = JSON.parse(message.body);
        this.setState({globalHighscores: highscores});
    }

    updateIdentity(message) {
        const ownIdx = message.body;
        this.setState({idx: ownIdx});

        // as soon as we know hwo we are, look if we have
        // a saved name and notify the server in that case
        let playerName = localStorage.getItem('playerName');
        console.log(playerName);
        if (playerName !== undefined && playerName !== null) {
            this.handleNameCommit(playerName)
        } else {
            this.setState({
                playerName: this.state.game.snakes[this.state.idx].name
            });
        }
    }

    handleKeydown(e) {
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                this.move("up");
                this.unpause();
                break;
            case "ArrowDown":
            case "KeyS":
                this.move("down");
                this.unpause();
                break;
            case "ArrowLeft":
            case "KeyA":
                this.move("left");
                this.unpause();
                break;
            case "ArrowRight":
            case "KeyD":
                this.move("right");
                this.unpause();
                break;
            case "KeyP":
                this.togglePause();
                break;
            case "KeyR":
                this.reset();
                break;
        }
    }

    handleNameChange(newName) {
        this.setState({playerName: newName});
    }

    handleNameCommit(newName) {
        if(this.stompClientPromise) {
            this.stompClientPromise.then(x => x.send("/app/setName", {}, newName));
        }
        localStorage.setItem('playerName', newName);
        this.setState({
            playerName: newName
        });
    }

    addAutopilot(type) {
        this.stompClientPromise.then(x => x.send("/app/addAI", {}, type));
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
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        <Canvas
                            draw={ctx => draw(ctx, this.state.game, options)}
                            width={this.state.game.width * this.state.scale}
                            height={this.state.game.height * this.state.scale}
                            tabIndex={-1}
                            onKeyDown={e => this.handleKeydown(e)}
                            focused={b => this.setState({blurred: !b})}
                        />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <PlayerPane
                            game={this.state.game}
                            shareUrl={this.state.shareUrl}
                            idx={this.state.idx}
                            playerName={this.state.playerName}
                            currentUser={this.props.currentUser}
                            handleNameCommit={s => this.handleNameCommit(s)}
                            handleNameChange={s => this.handleNameChange(s)}
                            newGame={(w, h) => this.newGame(w, h)}
                            addAutopilot={name => this.addAutopilot(name)}
                            togglePause={_ => this.togglePause()}
                            reset={_ => this.reset()}
                        />
                    </Grid>
                    <Grid item xs={12} lg={3}>
                        <ScorePane
                            game={this.state.game}
                            highscores={this.state.highscores}
                            globalHighscores={this.state.globalHighscores}
                        />
                    </Grid>
                </Grid>
            </Container>
        )
    }
}

GameView.propTypes = {
    currentUser: PropTypes.object
}

class PlayerPane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Grid container spacing={2} direction={'column'} component={Paper}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="outlined" onClick={_ => {this.props.togglePause()}}>
                                {this.props.game.paused ? "Unpause" : "Pause"}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="outlined" onClick={_ => {this.props.reset()}}>
                                Restart
                            </Button>
                        </Grid>
                    </Grid>
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
                        onCommit={(w, h) => this.props.newGame(w, h)}
                        gameWidth={this.props.game.width}
                        gameHeight={this.props.game.height}
                    />
                </Grid>
                <Grid item xs={12}>
                    <AddAutopilot
                        onCommit={type => this.props.addAutopilot(type)}
                    />
                </Grid>
            </Grid>
        )
    }
}


class ScorePane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const scores = this.props.game.snakes.map(snake => {
            return {
                idx: snake.idx,
                playerName: snake.name,
                score: snake.length,
                color: idx2color(snake.idx)
            }
        })

        return(
            <Grid container direction={'column'} spacing={2} component={Paper}>
                <Grid item xs={12}>
                    <Scores
                        key="Scores"
                        title="Scores"
                        scores={scores}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Scores
                        key="highscoresSize"
                        title={`Highscores for ${this.props.game.width} x ${this.props.game.height}`}
                        scores={this.props.highscores}
                    />
                </Grid>
                <Grid item xs={12}>
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

// TODO: rewrite with formik
class PlayerName extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            previous: this.props.name
        }

        this.onToggleEditMode = this.onToggleEditMode.bind(this);
        this.onRevert = this.onRevert.bind(this);
        this.onAccept = this.onAccept.bind(this);
    }

    onToggleEditMode() {
        this.setState((state, props) => ({
            editMode: !state.editMode,
            previous: props.name
        }));
    };

    onRevert() {
        this.props.onChange(this.state.previous);
        this.onToggleEditMode();
    };

    onAccept() {
        this.props.onCommit(this.props.name);
        this.onToggleEditMode();
    };

    render() {
        return(
            <Box>
                <h4>You are:</h4>

                <Grid container spacing={2}>
                    <Grid item>
                        <ColorViewer color={this.props.color}/>
                    </Grid>
                    <Grid item id={"playerNameView"} component={"Paper"}>
                        {this.state.editMode ? (
                            <TextField
                                value={this.props.name}
                                name="name"
                                label="Player Name"
                                onChange={e => this.props.onChange(e.target.value)}
                            />
                        ) : (
                            this.props.name
                        )}
                    </Grid>

                    {!this.props.loggedIn && this.state.editMode &&
                    <Grid item>
                        <IconButton
                            aria-label="done"
                            onClick={this.onAccept}
                        >
                            <DoneIcon/>
                        </IconButton>
                    </Grid>
                    }
                    {!this.props.loggedIn && this.state.editMode &&
                    <Grid item>
                        <IconButton
                            aria-label="revert"
                            onClick={this.onRevert}
                        >
                            <RevertIcon/>
                        </IconButton>
                    </Grid>
                    }
                    {!this.props.loggedIn && !this.state.editMode &&
                    <Grid item>
                        <IconButton
                            aria-label="edit"
                            onClick={this.onToggleEditMode}
                        >
                            <EditIcon/>
                        </IconButton>
                    </Grid>
                    }
                </Grid>
            </Box>
        );
    }
}

PlayerName.propTypes = {
    loggedIn: PropTypes.bool,
    name: PropTypes.string,
    color: PropTypes.string,
    onChange: PropTypes.func
}

class Scores extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const fields = this.props.scores.map((score, index) =>
            <TableRow key={score.name + index.toString()}>
                <TableCell>
                    <ColorViewer color={score.color}/>
                </TableCell>
                <TableCell>
                    {score.playerName}
                </TableCell>
                <TableCell>
                    {score.score}
                </TableCell>
            </TableRow>
        );

        return (
            <>
                <h2>{this.props.title}</h2>
                <TableContainer component={Paper}>
                    <Table aria-label={this.props.title} id="currentScores">
                        <TableBody>
                            {fields}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }
}

Scores.propTypes = {
    scores: PropTypes.array,
    title: PropTypes.string
}

class ColorViewer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Box sx={{
                width: 20,
                height: 20,
                bgcolor: this.props.color
            }}/>
        );
    }
}

ColorViewer.propTypes = {
    color: PropTypes.string
}

// TODO: rewrite with formik
class FieldSizeSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.gameWidth,
            height: this.props.gameHeight
        }

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <Grid container component={Paper}>
                <Grid item xs={12} lg={6}>
                    <Box spacing={2} m={2}>
                        <TextField
                            type="number"
                            label="width"
                            name="width"
                            value={this.state.width}
                            onChange={this.onChange}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Box spacing={2} m={2}>
                        <TextField
                            type="number"
                            label="height"
                            name="height"
                            value={this.state.height}
                            onChange={this.onChange}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} lg={12}>
                    <Box spacing={2} m={2}>
                        <Button
                            aria-label="done"
                            onClick={_ => this.props.onCommit(this.state.width, this.state.height)}
                            variant="outlined"
                        >
                            new game
                            <DoneIcon />
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        );
    }
}

FieldSizeSelector.propTypes = {
    onCommit: PropTypes.func,
    gameWidth: PropTypes.number,
    gameHeight: PropTypes.number
}

class AddAutopilot extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Grid container component={Paper}>
                <Grid item xs={12} lg={12}>
                    <Box spacing={2} m={2}>
                        <Button
                            aria-label="done"
                            onClick={_ => this.props.onCommit("SKSAW")}
                            variant="outlined"
                        >
                            Add AI
                            <AddIcon />
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        );
    }
}

AddAutopilot.propTypes = {
    onCommit: PropTypes.func
}

class ShareLink extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: "Click to copy"
        }
    }

    render() {
        return (
            <Box>
                <h4>Share this for others to join</h4>
                <Tooltip title={this.state.tooltip}>
                    <TextField
                        variant="outlined"
                        label="sharable link"
                        value={this.props.link}
                        onClick={() => {
                            navigator.clipboard.writeText(this.props.link);
                            this.setState({tooltip: "Copied!"})
                        }}
                        onMouseLeave={() => this.setState({
                            tooltip: "Click to copy"
                        })}
                        onChange={e => e.preventDefault()}
                    />
                </Tooltip>
            </Box>
        );
    }
}

ShareLink.propTypes = {
    link: PropTypes.string
}