import React, {useEffect, useState} from "react";
import {registerTouch, unregisterTouch} from "../registerTouch";
import {registerStomp, WebsocketMessage} from "../websockets/websocket-listener";
import {
    Container,
    Grid,
} from "@mui/material";
import genId from "../GenId"
import Canvas from "../visualization/canvas";
import {defaultVisualizationOptions, draw} from "../visualization/canvasDraw";
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

type StompSpec = {
    type: "new",
    id: string,
    width: number,
    height: number
} | {
    type: "existing",
    id: string
} | undefined;

export default function GameView(props: Props) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let id: string|undefined = params["id"];

    const {currentUser} = props;

    if (id) {
        // also remove the query string with the id, without reloading
        // https://stackoverflow.com/a/19279428
        const withoutQuery = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path: withoutQuery}, '', withoutQuery);
    }

    const [visOpts, setVisOpts] = useState(defaultVisualizationOptions);
    const [game, setGame] = useState<JsGameState>(new JsGameState(20, 20))// TODO: replace by a base class without functions
    const [highscores, setHighscores] = useState<Score[]>([]);
    const [globalHighscores, setGlobalHighscores] = useState<Score[]>([]);
    const [idx, setIdx] = useState(-1);
    const [playerName, setPlayerName] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [aiOptions, setAiOptions] = useState([]);

    const [stompSpec, setStompSpec] = useState<StompSpec>(undefined);
    const [stompClient, setStompClient] = useState<BufferedStompClient|undefined>(undefined);
    const [playerId, setPlayerId] = useState<string|undefined>(undefined);

    useEffect(() => {
        init(game.width, game.height);
        registerTouch((dir: Direction) => move(dir), () => unpause());

        axios.get("/api/listAi")
            .then(response => {
                setAiOptions(response.data);
            });

        return () => {
            unregisterTouch();
        }
    }, []);

    useEffect(() => {
        if(currentUser) {
            setPlayerName(currentUser.username);
        }
    }, [currentUser]);

    useEffect(() => {
        if(stompClient === undefined || playerId === undefined || !playerName) {
            return;
        }

        stompClient.bufferedPublish({
            destination: `/app/setName/${playerId}`,
            body: playerName
        });

        localStorage.setItem('playerName', playerName);
    }, [playerName, stompClient, playerId]);

    useEffect(() => {
        if(stompSpec === undefined) {
            return;
        }

        const sc = registerStomp([
            {route: '/topic/update/' + stompSpec.id, callback: updateGameState},
            {route: '/topic/newHighscore', callback: updateHighscore},
            {route: '/topic/newGlobalHighscore', callback: updateGlobalHighscore},
            {route: '/user/queue/joined', callback: updateIdentity},
        ]);

        const dest = stompSpec.type === "new"
            ? `/app/joinNewGame/${stompSpec.id}/${stompSpec.width}/${stompSpec.height}`
            : `/app/join/${stompSpec.id}`;

        sc.bufferedPublish({
            destination: dest,
            body: JSON.stringify({})
        });

        setStompClient(sc);

        return(() => {
            sc.deactivate();
            setStompClient(undefined);
            setPlayerId(undefined);
        });
    }, [stompSpec])

    function newGame(width: number, height: number) {
        id = undefined;
        init(width, height);
    }

    function init(width: number, height: number) {
        // check if we are joining an existing game, or starting a new one
        // https://stackoverflow.com/a/901144

        if(id === undefined) {
            joinNewGame(width, height)
        } else {
            join(id);
        }
    }

    function joinNewGame(width: number, height: number) {
        let id = genId(10);
        setStompSpec({
            id: id,
            type: "new",
            width: width,
            height: height
        });
    }

    function join(id: string) {
        setStompSpec({
            id: id,
            type: "existing"
        });
    }

    function updateIdentity(message: WebsocketMessage) {
        const playerInfo: PlayerInfo = JSON.parse(message.body);

        id = playerInfo.gameId;
        setPlayerId(playerInfo.playerId);
        console.log(message.body)
        console.log(id)
        console.log(playerId)

        const url = window.location.origin + `?id=${id}`;
        setShareUrl(url);
        setIdx(playerInfo.idx);

        // as soon as we know hwo we are, look if we have
        // a saved name and notify the server in that case
        let name = localStorage.getItem('playerName');
        if (name) {
            setPlayerName(name);
        } else {
            setPlayerName(playerInfo.name); // default name assigned by the server
        }
    }

    function move(dir: Direction) {
        if(stompClient === undefined || playerId === undefined) {
            throw "Server not ready yet";
        }

        stompClient.bufferedPublish({
            destination: `/app/move/${playerId}`,
            body: JSON.stringify(dir)
        });
    }

    function reset() {
        if(stompClient === undefined || playerId === undefined) {
            throw "Server not ready yet";
        }

        stompClient.bufferedPublish({
            destination: `/app/reset/${playerId}`
        });
    }

    function unpause() {
        if(game.paused) {
            if(stompClient === undefined || playerId === undefined) {
                throw "Server not ready yet";
            }

            stompClient.bufferedPublish({
                destination: `/app/unpause/${playerId}`
            });
        }
    }

    function pause() {
        if(!game.paused) {
            if(stompClient === undefined || playerId === undefined) {
                throw "Server not ready yet";
            }

            stompClient.bufferedPublish({
                destination: `/app/pause/${playerId}`
            });
        }
    }

    function togglePause() {
        if(game.paused) {
            unpause();
        } else {
            pause();
        }
    }

    function updateGameState(message: WebsocketMessage) {
        const gameState: JsGameState = JSON.parse(message.body);
        setGame(gameState);
    }

    function updateHighscore(message: WebsocketMessage) {
        if(message === undefined) {
            return;
        }

        const highscores: Score[] = JSON.parse(message.body);
        setHighscores(highscores);
    }

    function updateGlobalHighscore(message: WebsocketMessage) {
        if(message === undefined) {
            return;
        }

        const highscores: Score[] = JSON.parse(message.body);
        setGlobalHighscores(highscores);
    }

    function handleKeydown(e: KeyboardEvent) {
        switch (e.code) {
            case "ArrowUp":
            case "KeyW":
                move("up");
                unpause();
                break;
            case "ArrowDown":
            case "KeyS":
                move("down");
                unpause();
                break;
            case "ArrowLeft":
            case "KeyA":
                move("left");
                unpause();
                break;
            case "ArrowRight":
            case "KeyD":
                move("right");
                unpause();
                break;
            case "KeyP":
                togglePause();
                break;
            case "KeyR":
                reset();
                break;
        }
    }

    function handleNameCommit(newName: string) {
        setPlayerName(newName);
    }

    function addAutopilot(obj: AiOption) {
        let type = obj.id;

        if(stompClient === undefined || playerId === undefined) {
            throw "Server not ready yet";
        }

        stompClient.bufferedPublish({
            destination: `/app/addAI/${playerId}`,
            body: type
        });
    }

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4} pt={4} justifyContent="space-around" alignItems="flex-start">
                <Grid item xs={12} lg={6}>
                    <Canvas
                        draw={ctx => draw(ctx, game, visOpts)}
                        width={game.width * visOpts.scale}
                        height={game.height * visOpts.scale}
                        tabIndex={-1}
                        onKeyDown={(e: KeyboardEvent) => handleKeydown(e)}
                        focused={b => setVisOpts({...visOpts, blurred: !b})}
                        sx={{ mx: "auto" }}
                    />
                </Grid>
                <Grid item xs={12} lg={3}>
                    <PlayerPane
                        game={game}
                        shareUrl={shareUrl}
                        idx={idx}
                        playerName={playerName}
                        currentUser={props.currentUser}
                        handleNameCommit={s => handleNameCommit(s)}
                        newGame={(w, h) => newGame(w, h)}
                        addAutopilot={name => addAutopilot(name)}
                        aiOptions={aiOptions}
                        togglePause={() => togglePause()}
                        reset={() => reset()}
                    />
                </Grid>
                <Grid item xs={12} lg={3}>
                    <ScorePane
                        game={game}
                        highscores={highscores}
                        globalHighscores={globalHighscores}
                    />
                </Grid>
            </Grid>
        </Container>
    )
}
