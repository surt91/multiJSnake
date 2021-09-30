const React = require('react');
const ReactDOM = require('react-dom');
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Canvas from "./canvas";
import {registerStompPromise} from "./websocket-listener";
import {registerKeyPresses, registerTouch} from "./registerEvents";
import {draw} from "./canvasDraw";


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            height: 20,
            width: 20,
            scale: 20,
            paused: true,
            foodColor: "#cc2200",
            bgColor: "#000"
        };

        this.updateGameState = this.updateGameState.bind(this);
        this.updateHighscore = this.updateHighscore.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
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
            fetch(`/api/init/${this.state.width}/${this.state.height}`, {
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
        if(this.state.paused) {
            this.stompClientPromise.then(x => x.send("/app/unpause", {}, ""));
        }
    }

    pause() {
        if(!this.state.paused) {
            this.stompClientPromise.then(x => x.send("/app/pause", {}, ""));
        }
    }

    toggle_pause() {
        if(this.state.paused) {
            this.unpause();
        } else {
            this.pause();
        }
    }

    updateGameState(message) {
        const gameState = JSON.parse(message.body);
        this.setState({
            gameState: gameState,
            paused: gameState.paused
        });
    }

    updateHighscore(message) {
        if(typeof message === "undefined") {
            return;
        }

        const highscores = JSON.parse(message.body);
        this.setState({highscores: highscores});
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
                reset();
                break;
        }
    }

    //<!-- TODO share link -->
    //<!-- TODO current player scores -->

    render() {
        const options = {
            scale: this.state.scale,
            bgColor: this.state.bgColor,
            foodColor: this.state.foodColor
        }
        return (
            <Container maxWidth="lg">
                <Canvas
                    draw={ctx => draw(ctx, this.state.gameState, options)}
                    width={this.state.width * this.state.scale}
                    height={this.state.height * this.state.scale}
                />
                <Highscores highscores={this.state.highscores}/>
            </Container>
        )
    }
}

class Highscores extends React.Component {
    //highscores.forEach(score => {
    //let li = document.createElement("LI");
    //let textnode = document.createTextNode(`${score.playerName}: Length: ${score.score}`);
    //li.appendChild(textnode);
    //document.getElementById("highscore").appendChild(li);
    //})
    render() {
        return (
            <p>Highscores</p>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)