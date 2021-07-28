const SCALE = 20;
const COLOR = "#669900";
const FOOD = "#cc6600";
const BG_COLOR = "#000";
let SPEED = 200;  // speed: 200 -> 5 steps per second

let c = document.getElementById("restfulsnake");
let ctx = c.getContext("2d");
let W;
let H;
let ID;
let main_loop;

const main = async() =>  {
    // initialization
    // TODO: post /init, get the map object, including an id
    const response = await fetch("http://localhost:8080/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    });
    const initial_state = await response.json();
    W = initial_state.width;
    H = initial_state.height;
    ID = initial_state.id;

    c.width = (W * SCALE);
    c.height = (H * SCALE);
    // prevent scrolling so that we can use touch events of navigation
    c.style.cssText = "touch-action: none;";

    // main_loop 'loop'


    console.log("Welcome to jsnake!");
    console.log("Steer with WSAD and have some fun!");
    console.log("Enjoy its weird world with helical boudaries!");
    console.log("Speed up with e and down with q.");
    console.log(initial_state);
}
main().then(main_loop = loop(SPEED));

const move = async(dir) =>  {
    const response = await fetch("http://localhost:8080/" + ID + "/move/" + dir, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    return await response.json();
}

let next_move = "up";
// listen for keypresses
document.onkeydown = function(e) {
    switch(e.keyCode) {
        case 38:
        case 87:
            next_move = "up";
            break;
        case 40:
        case 83:
            next_move = "down";
            break;
        case 37:
        case 65:
            next_move = "left";
            break;
        case 39:
        case 68:
            next_move = "right";
            break;
        case 69:
            window.clearInterval(main_loop);
            SPEED *= 0.8;
            main_loop = loop(SPEED);
            break;
        case 81:
            window.clearInterval(main_loop);
            SPEED *= 1/0.8;
            main_loop = loop(SPEED);
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

    xDown = null;
    yDown = null;
};

function loop(speed) {
    return window.setInterval(function () {
        move(next_move).then(state => {
            console.log(state);
            draw(state);
        });
    }, speed);
}

function draw(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = FOOD;
    let x = state.food.x;
    let y = state.food.x;
    ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);

    ctx.fillStyle = COLOR;
    for(let seg of state.tail) {
        ctx.fillRect(seg.x*SCALE, seg.y*SCALE, SCALE, SCALE);
    }

    if(state.dead) {
        window.clearInterval(main_loop);
        ctx.fillStyle = "#aa0000";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", W*SCALE/2, H*SCALE/2);
    }
}