import React from "react";
import {registerTouch} from "../registerTouch";
import {registerStomp} from "../websocket-listener";
import {
    Container,
    Grid,
} from "@mui/material";
import Canvas from "../visualization/canvas";
import {draw} from "../visualization/canvasDraw";
import PropTypes from "prop-types";
import axios from "axios";
import PlayerPane from "./PlayerPane";
import ScorePane from "./ScorePane";

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
                snakes: {},
            },
            highscores: [],
            globalHighscores: [],
            idx: -1,
            blurred: false,
            playerName: "",
            shareUrl: "",
            aiOptions: []
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

        axios.get("/api/listAi")
            .then(response => {
                this.setState({aiOptions: response.data});
            });
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

        if(this.stompClient !== undefined) {
            // if we are already joined to a game, disconnect the existing
            // client before joining with a new one
            this.stompClient.deactivate();
        }

        this.stompClient = registerStomp([
            {route: '/topic/update/' + id, callback: this.updateGameState},
            {route: '/topic/newHighscore', callback: this.updateHighscore},
            {route: '/topic/newGlobalHighscore', callback: this.updateGlobalHighscore},
            {route: '/user/queue/getIdx', callback: this.updateIdentity},
        ]);

        this.stompClient.bufferedPublish({
            destination: '/app/join',
            body: id
        });
    }

    move(dir) {
        this.stompClient.bufferedPublish({
            destination: "/app/move",
            body: JSON.stringify(dir)
        });
    }

    reset() {
        this.stompClient.bufferedPublish({
            destination: "/app/reset"
        });
    }

    unpause() {
        if(this.state.game.paused) {
            this.stompClient.bufferedPublish({
                destination: "/app/unpause"
            });
        }
    }

    pause() {
        if(!this.state.game.paused) {
            this.stompClient.bufferedPublish({
                destination: "/app/pause"
            });
        }
    }

    togglePause() {
        if(this.state.game.paused) {
            this.unpause();
        } else {
            this.pause();
        }
    }

    nameFromGameState() {
        return this.state.game && this.state.idx >= 0 && this.state.game.snakes[this.state.idx].name || "Anonymous";
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
        if (playerName !== undefined && playerName !== null) {
            this.handleNameCommit(playerName)
        } else {
            const playerName = this.nameFromGameState();
            this.setState({
                playerName: playerName
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
        if(this.stompClient) {
            this.stompClient.bufferedPublish({
                destination: "/app/setName",
                body: newName
            });
        }
        localStorage.setItem('playerName', newName);
        this.setState({
            playerName: newName
        });
    }

    addAutopilot(obj) {
        let type = obj.id;
        this.stompClient.bufferedPublish({
            destination: "/app/addAI",
            body: type
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
                            tabIndex={-1}
                            onKeyDown={e => this.handleKeydown(e)}
                            focused={b => this.setState({blurred: !b})}
                            sx={{ mx: "auto" }}
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
                            aiOptions={this.state.aiOptions}
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



