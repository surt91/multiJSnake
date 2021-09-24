import {registerStomp} from "./websocket-listener.js";
import {random_color} from "./color.js";

// global variables for some state.
// FIXME: maybe I should put this in a class or something
const SCALE = 20;
const FOOD = "#cc2200";
const BG_COLOR = "#000";

let W;
let H;
let ID;
let SNAKE_ID;
let paused = true;

let stompClient;
const c = document.getElementById("restfulsnake");
let ctx = c.getContext("2d");

function init() {
    // check if we are joining an existing game, or starting a new one
    // https://stackoverflow.com/a/901144
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    const id = params["id"];
    let promise;
    if(id === undefined) {
        promise = fetch("/api/init", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
    } else {
        promise = fetch("/api/" + id + "/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
    }

    // initialization
    promise
        .then(response => response.json())
        .then((json) => {
            console.log(json);
            // FIXME: if the id does not exist, we need to show an error
            let {snakeId, state} = json;
            console.log(state);
            W = state.width;
            H = state.height;
            ID = state.id;
            SNAKE_ID = snakeId;

            let url = window.location.origin + `?id=${ID}`;
            document.getElementById("share").innerHTML = `Share this link for others to join: ${url}`;

            c.width = (W * SCALE);
            c.height = (H * SCALE);
            // prevent scrolling so that we can use touch events of navigation
            c.style.cssText = "touch-action: none;";

            paused = true;
            draw(state);

            stompClient = registerStomp([
                {route: '/topic/update/' + ID, callback: drawWebSocket},
            ]);
        });

    console.log("Welcome to RestfulSnake!");
    console.log("Steer with WSAD and have some fun!");
    console.log("Pause with p.");
    console.log("Start new with r.");
}

init();

function move(dir) {
    stompClient.send("/app/move", {}, JSON.stringify({id: ID, idx: SNAKE_ID, move: dir}));
}

// listen for keypresses
document.onkeydown = function(e) {
    switch(e.code) {
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
            toggle_pause();
            break;
        case "KeyR":
            reset();
            break;
    }
}

// steering using touch gestures
let xDown = null;
let yDown = null;

document.ontouchstart = function(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

document.ontouchmove = function (evt) {
    if(! xDown || ! yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    // only handle the event, if the swipe started or ended in the canvas
    let r = c.getBoundingClientRect();
    if(
        xUp - r.left > 0
        && yUp - r.top > 0
        && xUp - r.right < 0
        && yUp - r.bottom < 0
        ||     xDown - r.left > 0
        && yDown - r.top > 0
        && xDown - r.right < 0
        && yDown - r.bottom < 0) {
        // we are inside, just pass
    } else {
        // do not steer if the event was outside
        return;
    }

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    // which component is longer
    if(Math.abs(xDiff) > Math.abs(yDiff)) {
        if ( xDiff > 0 ) {
            move("left");
        } else {
            move("right");
        }
    } else {
        if(yDiff > 0) {
            move("up");
        } else {
            move("down");
        }
    }

    unpause();

    xDown = null;
    yDown = null;
};

function reset() {
    stompClient.send("/app/reset", {}, ID);
}

function unpause() {
    stompClient.send("/app/unpause", {}, ID);
}

function pause() {
    stompClient.send("/app/pause", {}, ID);
}

function toggle_pause() {
    if(paused) {
        unpause();
    } else {
        pause();
    }
}

function drawWebSocket(message) {
    draw(JSON.parse(message.body))
}

function drawSnake(snake, color) {
    ctx.fillStyle = color;
    let x = snake.head.x;
    let y = snake.head.y;
    if(snake.headDirection === "right") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "left") {
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "down") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE+SCALE/2, SCALE/2., SCALE/2);
    }
    if(snake.headDirection === "up") {
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/2, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE, SCALE/2., SCALE/2);
    }

    for(let seg of snake.tail) {
        ctx.fillRect(seg.x*SCALE, seg.y*SCALE, SCALE, SCALE);
    }
}

function draw(state) {
    console.log("draw!", state);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = FOOD;
    let x = state.food.x;
    let y = state.food.y;
    ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);

    state.snakes.forEach(snake => drawSnake(snake, random_color(snake.idx)));

    if(state.paused) {
        paused = true;
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Paused", W*SCALE/2, H*SCALE/2);
    } else {
        paused = false;
    }

    if(state.gameOver) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W*SCALE/2, H*SCALE/2);
    }

    // show scores
    document.getElementById("score").replaceChildren();
    state.snakes.forEach(snake => {
        let li = document.createElement("LI");
        let textnode = document.createTextNode(`Player ${snake.idx}: Length: ${snake.length}`);
        li.appendChild(textnode);
        li.style = "background-color: " + random_color(snake.idx);
        document.getElementById("score").appendChild(li);
    })
}