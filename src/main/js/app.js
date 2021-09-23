const SCALE = 20;
const COLOR = "#669900";
const FOOD = "#cc2200";
const BG_COLOR = "#000";
let SPEED = 200;  // speed: 200 -> 5 steps per second
let paused = true;

let c = document.getElementById("restfulsnake");
let ctx = c.getContext("2d");
let W;
let H;
let ID;
let next_move = "up";

var stompClient = require('./websocket-listener')

const init = () =>  {
    // initialization
    fetch("/api/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json()
    ).then(initial_state => {
        console.log(initial_state);
        W = initial_state.width;
        H = initial_state.height;
        ID = initial_state.id;

        c.width = (W * SCALE);
        c.height = (H * SCALE);
        // prevent scrolling so that we can use touch events of navigation
        c.style.cssText = "touch-action: none;";

        draw(initial_state);

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
    return fetch("/api/" + ID + "/move/" + dir, {
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

function draw(state) {
    console.log("draw!", state);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = FOOD;
    let x = state.food.x;
    let y = state.food.y;
    ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);

    ctx.fillStyle = COLOR;
    x = state.snake.head.x;
    y = state.snake.head.y;
    if(state.snake.head_direction === "right") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(state.snake.head_direction === "left") {
        ctx.fillRect(x*SCALE+SCALE/2., y*SCALE, SCALE/2, SCALE);
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/4, SCALE/2., SCALE/2);
    }
    if(state.snake.head_direction === "down") {
        ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE+SCALE/2, SCALE/2., SCALE/2);
    }
    if(state.snake.head_direction === "up") {
        ctx.fillRect(x*SCALE, y*SCALE+SCALE/2, SCALE, SCALE/2);
        ctx.fillRect(x*SCALE+SCALE/4., y*SCALE, SCALE/2., SCALE/2);
    }

    ctx.fillStyle = COLOR;
    for(let seg of state.snake.tail) {
        ctx.fillRect(seg.x*SCALE, seg.y*SCALE, SCALE, SCALE);
    }

    if(state.snake.dead) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W*SCALE/2, H*SCALE/2);
    }

    document.getElementById("score").innerHTML = `Score: ${state.score}`;
}