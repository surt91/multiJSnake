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
    IconButton,
    Button,
    Tooltip
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import RevertIcon from "@material-ui/icons/NotInterestedOutlined";
import AddIcon from '@material-ui/icons/Add';
import {registerStompPromise} from "./websocket-listener";
import {registerKeyPresses, registerTouch} from "./registerEvents";
import Canvas from "./canvas";
import {LoginDialog, RegisterDialog} from "./formDialog";
import {draw} from "./canvasDraw";
import * as yup from 'yup';
import AuthService from "./AuthService";

// make sure to use https, otherwise the copy to clipboard will not work
if (location.protocol !== 'https:' && location.hostname !== "localhost") {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

class App extends React.Component {

    constructor(props) {
        super(props);

        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        // also remove the query string with the id, without reloading
        // https://stackoverflow.com/a/19279428
        const withoutQuery = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path: withoutQuery}, '', withoutQuery);

        this.id = params["id"];

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
        registerKeyPresses(true, this.handleKeydown);
        // registerTouch();
        this.updateCurrentUser();
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
                this.toggle_pause();
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
        this.stompClientPromise.then(x => x.send("/app/setName", {}, newName));
        localStorage.setItem('playerName', newName);
        this.setState({
            playerName: newName
        });
    }

    addAutopilot(type) {
        this.stompClientPromise.then(x => x.send("/app/addAI", {}, type));
    }

    updateCurrentUser() {
        this.setState({currentUser: AuthService.getCurrentUser()})
        if(Boolean(this.state.currentUser)) {
            this.handleNameCommit(this.state.currentUser.username)
        }
    }

    onLogin(_values) {
        this.updateCurrentUser();
    }

    onRegistration(_values) {
        this.updateCurrentUser();
    }

    onLogout(_values) {
        this.updateCurrentUser();
    }

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

        const validationSchemaLogin = yup.object({
            username: yup
                .string('Enter your username')
                .required('Email is required'),
            password: yup
                .string('Enter your password')
                .required('Password is required'),
        });

        const validationSchemaRegister = yup.object({
            email: yup
                .string('Enter your email')
                .email('Enter a valid email')
                .required('Email is required'),
            username: yup
                .string('Enter your username')
                .min(3, 'Username should be of minimum 3 characters length')
                .required('Email is required'),
            password: yup
                .string('Enter your password')
                .min(8, 'Password should be of minimum 8 characters length')
                .required('Password is required'),
        });

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
                    <Grid item xs={12} lg={6}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <ShareLink
                                    link={this.state.shareUrl}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                {this.state.currentUser ?
                                    <Button variant="outlined" onClick={_ => {AuthService.logout(); this.onLogout()}}>
                                        {"Logout"}
                                    </Button>
                                    :
                                    <Grid container spacing={2}>
                                        <Grid item>
                                            <LoginDialog
                                                buttonText={"Login"}
                                                validationSchema={validationSchemaLogin}
                                                authService={AuthService}
                                                onSuccess={values => this.onLogin(values)}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <RegisterDialog
                                                buttonText={"Register"}
                                                validationSchema={validationSchemaRegister}
                                                authService={AuthService}
                                                onSuccess={values => this.onRegistration(values)}
                                            />
                                        </Grid>
                                    </Grid>
                                }
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Grid container direction={'column'} spacing={2}>
                                    <Grid item xs={12}>
                                        <h2>Settings</h2>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {this.state.idx >= 0 ?
                                            <PlayerName
                                                name={this.state.playerName}
                                                color={idx2color(this.state.idx)}
                                                onCommit={this.handleNameCommit}
                                                onChange={this.handleNameChange}
                                                loggedIn={Boolean(this.state.currentUser)}
                                                switchGlobalListener={bool => registerKeyPresses(bool, this.handleKeydown)}
                                            /> : <></>}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FieldSizeSelector
                                            onCommit={(w, h) => this.newGame(w, h)}
                                            gameWidth={this.state.game.width}
                                            gameHeight={this.state.game.height}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <AddAutopilot
                                            onCommit={type => this.addAutopilot(type)}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Grid container direction={'column'} spacing={2}>
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
                                            title={`Highscores for ${this.state.game.width} x ${this.state.game.width}`}
                                            scores={this.state.highscores}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Scores
                                            key="Highscores"
                                            title="Highscores"
                                            scores={this.state.globalHighscores}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
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
        this.props.switchGlobalListener(this.state.editMode);
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
                                        value={this.props.name}
                                        name="name"
                                        label="Player Name"
                                        onChange={e => this.props.onChange(e.target.value)}
                                    />
                                ) : (
                                    this.props.name
                                )}
                            </TableCell>
                            {!this.props.loggedIn &&
                                <TableCell>
                                    {this.state.editMode ? (
                                        <>
                                            <IconButton
                                                aria-label="done"
                                                onClick={this.onAccept}
                                            >
                                                <DoneIcon/>
                                            </IconButton>
                                            <IconButton
                                                aria-label="revert"
                                                onClick={this.onRevert}
                                            >
                                                <RevertIcon/>
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton
                                            aria-label="edit"
                                            onClick={this.onToggleEditMode}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    )}
                                </TableCell>
                            }
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

class ShareLink extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltip: "Click to copy"
        }
    }

    render() {
        return (
            <Grid container component={Paper}>
                <Grid item xs={12} lg={12}>
                    <Box spacing={2} m={2}>
                        Share this for others to join
                        <Tooltip title={this.state.tooltip}>
                            <Button
                                style={{textTransform: 'none'}}
                                onClick={() => {
                                    navigator.clipboard.writeText(this.props.link);
                                    this.setState({tooltip: "Copied!"})
                                }}
                                onMouseLeave={() => this.setState({
                                    tooltip: "Click to copy"
                                })}
                                variant="outlined"
                            >
                                {this.props.link}
                            </Button>
                        </Tooltip>
                    </Box>
                </Grid>
            </Grid>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)