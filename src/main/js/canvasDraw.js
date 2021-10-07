import {desaturized_idx2color, idx2color} from "./color";

function drawSnake(ctx, snake, options) {
    const {scale} = options;
    let color;
    if(snake.dead) {
        color = desaturized_idx2color(snake.idx);
    } else {
        color = idx2color(snake.idx)
    }

    ctx.fillStyle = color;
    let x = snake.head.x;
    let y = snake.head.y;
    if(snake.headDirection === "right") {
        ctx.fillRect(x*scale, y*scale, scale/2, scale);
        ctx.fillRect(x*scale+scale/2., y*scale+scale/4, scale/2., scale/2);
    }
    if(snake.headDirection === "left") {
        ctx.fillRect(x*scale+scale/2., y*scale, scale/2, scale);
        ctx.fillRect(x*scale, y*scale+scale/4, scale/2., scale/2);
    }
    if(snake.headDirection === "down") {
        ctx.fillRect(x*scale, y*scale, scale, scale/2);
        ctx.fillRect(x*scale+scale/4., y*scale+scale/2, scale/2., scale/2);
    }
    if(snake.headDirection === "up") {
        ctx.fillRect(x*scale, y*scale+scale/2, scale, scale/2);
        ctx.fillRect(x*scale+scale/4., y*scale, scale/2., scale/2);
    }

    for(let seg of snake.tail) {
        ctx.fillRect(seg.x*scale, seg.y*scale, scale, scale);
    }
}

export function draw(ctx, state, options) {
    if(state === undefined) {
        return;
    }

    const {scale, bgColor, foodColor, blurred} = options;
    let width = state.width;
    let height = state.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width*scale, height*scale);

    ctx.fillStyle = foodColor;
    let x = state.food.x;
    let y = state.food.y;
    ctx.fillRect(x*scale, y*scale, scale, scale);

    state.snakes.forEach(snake => drawSnake(ctx, snake, options));

    if(blurred) {
        ctx.fillStyle = "#cccc22";
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillText("Click here!", width * scale / 2, height * scale / 4);
        ctx.font = "15px Arial";
        ctx.fillText("For your key presses to be registered", width * scale / 2, height * scale / 4 + 25);
    }

    if(state.paused) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Paused", width * scale / 2, height * scale / 2);
        ctx.font = "15px Arial";
        ctx.fillText("Press 'WASD' to steer your Snake", width * scale / 2, height * scale / 2 + 25);
    }

    if(state.gameOver) {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", width * scale / 2, height * scale /4 * 3);
        ctx.font = "15px Arial";
        ctx.fillText("Press 'R' to restart the game", width * scale / 2, height * scale / 4 * 3 + 25);
    }
}

function drawError(text) {
    //console.log("draw error!", text);
    //console.log(W, H);

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, W*SCALE, H*SCALE);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, W*SCALE/2, H*SCALE/2);

    //let textnode = document.createTextNode(`Error: ${text}`);
    //document.getElementById("score").appendChild(textnode);
}
