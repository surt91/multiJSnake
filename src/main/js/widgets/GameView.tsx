import React from "react";
import {registerTouch, unregisterTouch} from "../registerTouch";
import {registerStomp, WebsocketMessage} from "../websockets/websocket-listener";
import {
    Container,
    Grid,
} from "@mui/material";
import genId from "../GenId"
import Canvas from "../visualization/canvas";
import {defaultVisualizationOptions, draw, VisualizationOptions} from "../visualization/canvasDraw";
import axios from "axios";
import PlayerPane from "./PlayerPane";
import ScorePane from "./ScorePane";
import {Direction} from "../SnakeLogic/JsSnake";
import JsGameState from "../SnakeLogic/JsGameState";
import {AiOption} from "./Ai";
import {User} from "./Profile";
import {Score} from "./Scores";
import BufferedStompClient from "../websockets/BufferedStompClient";

type Props = {
    currentUser?: User
}

type State = {
    aiOptions: AiOption[],
    game: JsGameState,
    idx: number,
    shareUrl: string,
    playerName: string,

    visOpts: VisualizationOptions,

    highscores: Score[],
    globalHighscores: Score[],
}

export class GameView extends React.Component<Props, State> {
    private id?: string;
    private stompClient?: BufferedStompClient;
    private playerId?: string;

    constructor(props: Props) {
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
            visOpts: defaultVisualizationOptions,
            game: new JsGameState(20, 20), // TODO: replace by a base class without functions
            highscores: [],
            globalHighscores: [],
            idx: -1,
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
        registerTouch((dir: Direction) => this.move(dir), () => this.unpause());

        axios.get("/api/listAi")
            .then(response => {
                this.setState({aiOptions: response.data});
            });
    }

    componentWillUnmount() {
        unregisterTouch();
        this.stompClient && this.stompClient.deactivate();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.props.currentUser && prevProps.currentUser !== this.props.currentUser) {
            this.handleNameCommit(this.props.currentUser.username)
        }
    }

    newGame(width: number, height: number) {
        this.id = undefined;
        this.init(width, height);
    }

    init(width: number, height: number) {
        // check if we are joining an existing game, or starting a new one
        // https://stackoverflow.com/a/901144

        if(this.id === undefined) {
            this.joinNewGame(width, height)
        } else {
            this.join(this.id);
        }
    }

    joinNewGame(width: number, height: number) {
        let id = genId(10);

        if(this.stompClient !== undefined) {
            // if we are already joined to a game, disconnect the existing
            // client before joining with a new one
            this.stompClient.deactivate();
        }

        this.stompClient = registerStomp([
            {route: '/topic/update/' + id, callback: this.updateGameState},
            {route: '/topic/newHighscore', callback: this.updateHighscore},
            {route: '/topic/newGlobalHighscore', callback: this.updateGlobalHighscore},
            {route: '/user/queue/joined', callback: this.updateIdentity},
        ]);

        this.stompClient.bufferedPublish({
            destination: `/app/joinNewGame/${id}/${width}/${height}`,
            body: JSON.stringify({})
        });
    }

    join(id?: string) {
        if (id === undefined) {
            // TODO: raise an error
            return;
        }

        if(this.stompClient !== undefined) {
            // if we are already joined to a game, disconnect the existing
            // client before joining with a new one
            this.stompClient.deactivate();
        }

        this.stompClient = registerStomp([
            {route: '/topic/update/' + id, callback: this.updateGameState},
            {route: '/topic/newHighscore', callback: this.updateHighscore},
            {route: '/topic/newGlobalHighscore', callback: this.updateGlobalHighscore},
            {route: '/user/queue/joined', callback: this.updateIdentity},
        ]);

        this.stompClient.bufferedPublish({
            destination: `/app/join/${id}`,
            body: JSON.stringify({})
        });
    }

    updateIdentity(message: WebsocketMessage) {
        const playerInfo = JSON.parse(message.body);

        this.id = playerInfo.gameId;
        this.playerId = playerInfo.playerId;
        console.log(message.body)
        console.log(this.id)
        console.log(this.playerId)

        const url = window.location.origin + `?id=${this.id}`;
        this.setState({
            shareUrl: url,
            idx: playerInfo.idx
        });

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

    move(dir: Direction) {
        this.stompClient && this.stompClient.bufferedPublish({
            destination: `/app/move/${this.playerId}`,
            body: JSON.stringify(dir)
        });
    }

    reset() {
        this.stompClient && this.stompClient.bufferedPublish({
            destination: `/app/reset/${this.playerId}`
        });
    }

    unpause() {
        if(this.state.game.paused) {
            this.stompClient && this.stompClient.bufferedPublish({
                destination: `/app/unpause/${this.playerId}`
            });
        }
    }

    pause() {
        if(!this.state.game.paused) {
            this.stompClient && this.stompClient.bufferedPublish({
                destination: `/app/pause/${this.playerId}`
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

    updateGameState(message: WebsocketMessage) {
        const gameState = JSON.parse(message.body);
        this.setState({
            game: gameState
        });
    }

    updateHighscore(message: WebsocketMessage) {
        if(message === undefined) {
            return;
        }

        const highscores = JSON.parse(message.body);
        this.setState({highscores: highscores});
    }

    updateGlobalHighscore(message: WebsocketMessage) {
        if(message === undefined) {
            return;
        }

        const highscores = JSON.parse(message.body);
        this.setState({globalHighscores: highscores});
    }

    handleKeydown(e: KeyboardEvent) {
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

    handleNameChange(newName: string) {
        this.setState({playerName: newName});
    }

    handleNameCommit(newName: string) {
        if(this.stompClient) {
            this.stompClient.bufferedPublish({
                destination: `/app/setName/${this.playerId}`,
                body: newName
            });
        }
        localStorage.setItem('playerName', newName);
        this.setState({
            playerName: newName
        });
    }

    addAutopilot(obj: AiOption) {
        let type = obj.id;
        this.stompClient && this.stompClient.bufferedPublish({
            destination: `/app/addAI/${this.playerId}`,
            body: type
        });
    }

    render() {
        return (
            <Container maxWidth="lg">
                <Grid container spacing={4} pt={4} justifyContent="space-around" alignItems="flex-start">
                    <Grid item xs={12} lg={6}>
                        <Canvas
                            draw={ctx => draw(ctx, this.state.game, this.state.visOpts)}
                            width={this.state.game.width * this.state.visOpts.scale}
                            height={this.state.game.height * this.state.visOpts.scale}
                            tabIndex={-1}
                            onKeyDown={(e: KeyboardEvent) => this.handleKeydown(e)}
                            focused={b => this.setState({visOpts: {...this.state.visOpts, blurred: !b}})}
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
                            togglePause={() => this.togglePause()}
                            reset={() => this.reset()}
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


