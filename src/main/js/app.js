const SCALE = 20;
const FOOD = "#cc2200";
const BG_COLOR = "#000";
// let SPEED = 200;  // speed: 200 -> 5 steps per second
let paused = true;

let c = document.getElementById("restfulsnake");
let ctx = c.getContext("2d");
let W;
let H;
let ID;
let SNAKE_ID;
// let next_move = "up";

var stompClient = require('./websocket-listener')

// https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
function hsv_to_rgb(h, s, v) {
    const h_i = Math.floor(h*6);
    const f = h*6 - h_i;
    const p = v * (1 - s);
    const q = v * (1 - f*s);
    const t = v * (1 - (1 - f) * s);
    let r, g, b;
    if(h_i===0) {
        [r, g, b] = [v, t, p];
    } else if(h_i===1) {
        [r, g, b] = [q, v, p];
    } else if(h_i===2) {
        [r, g, b] = [p, v, t];
    } else if(h_i===3) {
        [r, g, b] = [p, q, v];
    } else if(h_i===4) {
        [r, g, b] = [t, p, v];
    } else if(h_i===5) {
        [r, g, b] = [v, p, q];
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    return rgbToHex(Math.floor(r*256), Math.floor(g*256), Math.floor(b*256));
}

function random_color(n) {
    const GOLDEN_RATIO_CONJUGATE = 0.618033988749895
    const HUE = 0.3;

    let h = HUE + GOLDEN_RATIO_CONJUGATE * n;
    h -= Math.floor(h);
    return hsv_to_rgb(h, 0.5, 0.95)
}

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

        draw(state);

        stompClient.register([
            {route: '/topic/update/' + ID, callback: drawWebSocket},
        ]);
    });

    pause();

    console.log("Welcome to RestfulSnake!");
    console.log("Steer with WSAD and have some fun!");
    console.log("Speed up with e and down with q.");
    console.log("Pause with p.");
    console.log("Start new with r.");
}

init();

const move = (dir) =>  {
    return fetch("/api/" + ID + "/" + SNAKE_ID + "/move/" + dir, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json());
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
            init();
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
            next_move = "left";
        } else {
            next_move = "right";
        }
    } else {
        if(yDiff > 0) {
            next_move = "up";
        } else {
            next_move = "down";
        }
    }

    unpause();

    xDown = null;
    yDown = null;
};

function unpause() {
    if(paused) {
        paused = false;
        fetch("/api/" + ID + "/unpause", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}

function pause() {
    if(!paused) {
        fetch("/api/" + ID + "/pause", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        paused = true;

        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Paused", W*SCALE/2, H*SCALE/2);
    }
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
    x = snake.head.x;
    y = snake.head.y;
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

    if(state.gameOver) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W*SCALE/2, H*SCALE/2);
    }

    document.getElementById("score").innerHTML = `Score: ${state.score}`;
}