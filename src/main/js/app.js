import {idx2color} from "./color";

const React = require('react');
const ReactDOM = require('react-dom');
import {
    Container,
    TextField,
    Grid,
    Box,
    TableContainer,
    Table,
    TableRow,
    TableBody,
    TableCell,
    Paper,
    IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import RevertIcon from "@material-ui/icons/NotInterestedOutlined";
import {registerStompPromise} from "./websocket-listener";
import {registerKeyPresses, registerTouch} from "./registerEvents";
import Canvas from "./canvas";
import {draw} from "./canvasDraw";


class App extends React.Component {

    constructor(props) {
        super(props);
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
            idx: -1
        };

        this.updateGameState = this.updateGameState.bind(this);
        this.updateHighscore = this.updateHighscore.bind(this);
        this.updateIdentity = this.updateIdentity.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    componentDidMount() {
        this.init();
        registerKeyPresses(this.handleKeydown);
        // registerTouch();
    }

    init() {
        // check if we are joining an existing game, or starting a new one
        // https://stackoverflow.com/a/901144
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());

        const id = params["id"];

        if(id === undefined) {
            fetch(`/api/init/${this.state.game.width}/${this.state.game.height}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => response.json())
                .then((x) => {
                    this.join(x.id);
                });
        } else {
            this.join(id);
        }
    }

    join(id) {
        const url = window.location.origin + `?id=${id}`;

        this.setState({
            shareUrl: url,
            id: id
        });

        this.stompClientPromise = registerStompPromise([
            {route: '/topic/update/' + id, callback: this.updateGameState},
            {route: '/topic/newHighscore', callback: this.updateHighscore},
            {route: '/user/queue/getIdx', callback: this.updateIdentity},
        ]).then(x => {
            x.send("/app/join", {}, id);

            // as soon as the connection is established, look if we have
            // a saved name and notify the server in that case
            let playerName = localStorage.getItem('playerName');
            if (playerName !== undefined) {
                this.handleNameChange(playerName)
            }

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

    toggle_pause() {
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

    updateIdentity(message) {
        const ownIdx = message.body;
        this.setState({idx: ownIdx});
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
                this.toggle_pause();
                break;
            case "KeyR":
                this.reset();
                break;
        }
    }

    handleNameChange(newName) {
        this.stompClientPromise.then(x => x.send("/app/setName", {}, newName));
        localStorage.setItem('playerName', newName);
    }

    //<!-- TODO share link -->

    render() {
        const options = {
            scale: this.state.scale,
            bgColor: this.state.bgColor,
            foodColor: this.state.foodColor
        }
        const scores = this.state.game.snakes.map(snake => {
            return {
                idx: snake.idx,
                playerName: snake.name,
                score: snake.length,
                color: idx2color(snake.idx)
            }
        })

        return (
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={6}>
                        <Canvas
                            draw={ctx => draw(ctx, this.state.game, options)}
                            width={this.state.game.width * this.state.scale}
                            height={this.state.game.height * this.state.scale}
                        />
                    </Grid>
                    <Grid item xs={4} lg={3}>
                        <h2>Settings</h2>
                        {this.state.idx >= 0 ?
                            <PlayerName
                                name={this.state.game.snakes[this.state.idx].name}
                                color={idx2color(this.state.idx)}
                                onCommit={this.handleNameChange}
                            /> : <></>}
                        {/* set size of field */}
                    </Grid>
                    <Grid item xs={4} lg={3}>
                        <Scores
                            key="Scores"
                            title="Scores"
                            scores={scores}
                        />
                        <Scores
                            key="Highscores"
                            title="Highscores"
                            scores={this.state.highscores}
                        />
                    </Grid>
                </Grid>


            </Container>
        )
    }
}

class PlayerName extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            name: this.props.name,
            previous: this.props.name
        }

        this.onToggleEditMode = this.onToggleEditMode.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onRevert = this.onRevert.bind(this);
        this.onAccept = this.onAccept.bind(this);
    }

    onToggleEditMode() {
        this.setState((state, _props) => ({editMode: !state.editMode}));
    };

    onChange(e) {
        const value = e.target.value;
        this.setState({name: value});
    };

    onRevert() {
        this.setState((state, _props) => ({name: state.previous}));
        this.onToggleEditMode();
    };

    onAccept() {
        this.setState({previous: this.state.name});
        this.onToggleEditMode();
        this.props.onCommit(this.state.name);
    };

    render() {
        return(
            <>
            <TableContainer component={Paper}>
                <Table aria-label={this.props.title}>
                    <TableBody>
                        <TableRow key="playername">
                            <TableCell>
                                <ColorViewer color={this.props.color}/>
                            </TableCell>
                            <TableCell>
                                {this.state.editMode ? (
                                    <TextField
                                        value={this.state.name}
                                        name="name"
                                        label="Player Name"
                                        onChange={e => this.onChange(e)}
                                    />
                                ) : (
                                    this.state.name
                                )}
                            </TableCell>
                            <TableCell>
                                {this.state.editMode ? (
                                    <>
                                        <IconButton
                                            aria-label="done"
                                            onClick={this.onAccept}
                                        >
                                            <DoneIcon />
                                        </IconButton>
                                        <IconButton
                                            aria-label="revert"
                                            onClick={this.onRevert}
                                        >
                                            <RevertIcon />
                                        </IconButton>
                                    </>
                                ) : (
                                    <IconButton
                                        aria-label="edit"
                                        onClick={this.onToggleEditMode}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            </>
        );
    }
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
                <Table aria-label={this.props.title}>
                    <TableBody>
                        {fields}
                    </TableBody>
                </Table>
            </TableContainer>
            </>
        )
    }
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

ReactDOM.render(
    <App />,
    document.getElementById('react')
)