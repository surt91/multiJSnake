import React from "react";
import Canvas from "./canvas";
import {draw} from "./canvasDraw";
import {Container, Grid} from "@mui/material";
import * as tf from "@tensorflow/tfjs";


class JsSnake {
    constructor(w, h, head) {
        this.tail = [];
        this.length = 2;
        this.head = head;
        this.headDirection = "up";
        this.dead = false;
        this.idx = 0;
    }

}

class JsGameState {
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.food = {x: -1, y: -1};
        this.snakes = [new JsSnake()];

        this.reset();
    }

    // TODO: do something better, a hashmap or bitmap, or something
    isOccupied(site) {
        let {x, y} = site;
        return this.snakes.some(snake => snake.tail.some(site => site.x === x && site.y === y));
    }

    isWall(site) {
        let {x, y} = site;
        return x < 0 || x >= this.width || y < 0 || y >= this.height;
    }

    isEating(snake) {
        return snake.head.x === this.food.x && snake.head.y === this.food.y;
    }

    randomSite() {
        let site;
        do {
            site = {x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height)};
        } while (this.isOccupied(site));
        return site;
    }

    add_food() {
        this.food = this.randomSite();
    }

    /// get the state of the game
    /// here we take bitmap of the field with multiple layers:
    /// first layer: 1: food, else 0
    /// second layer: 1: head of the current snake, else 0
    /// third layer: number of turns the site will be occupied by the tail of a snake
    /// this is inspired by https://towardsdatascience.com/learning-to-play-snake-at-1-million-fps-4aae8d36d2f1
    trainingBitmap() {
        let state = new Array(this.width);
        for (let i = 0; i < this.width; i++) {
            state[i] = new Array(this.height);
            for (let j = 0; j < this.width; j++) {
                state[i][j] = new Array(3);
                for (let k = 0; k < 3; k++) {
                    state[i][j][k] = 0;
                }
            }
        }
        let snake = this.snakes[0];

        state[this.food.x][this.food.y][0] = 1;
        // the head can be outside of the field (after collision with a wall)
        if(!this.isWall(snake.head)) {
            state[snake.head.x][snake.head.y][1] = 1;
        }

        let ctr = 1;
        for(let site of snake.tail) {
            state[site.x][site.y][2] = ctr;
            ctr += 1;
        }
        // if(!this.isWall(snake.head)) {
        //     state[snake.head.x][snake.head.y][2] = ctr;
        // }
        //
        // // your own head is ok ... this is probably not necessary ...
        // if(!this.isWall(snake.head)) {
        //     state[snake.head.x][snake.head.y][2] = 0;
        // }

        return state;
    }

    absoluteAction2Move(action) {
        let snake = this.snakes[0];
        switch (action) {
            case 0:
                // north
                snake.headDirection = "up";
                break;
            case 1:
                // east
                snake.headDirection = "right";
                break;
            case 2:
                // south
                snake.headDirection = "down";
                break;
            case 3:
                // west
                snake.headDirection = "left";
                break;
        }
    }

    next_site(site, direction) {
        switch (direction) {
            case "up":
                // north
                return {x: site.x, y: site.y - 1};
            case "right":
                // east
                return {x: site.x + 1, y: site.y};
            case "down":
                // south
                return {x: site.x, y: site.y + 1};
            case "left":
                // west
                return {x: site.x - 1, y: site.y};
        }
    }

    reset() {
        this.food = this.randomSite();
        this.snakes[0].head = this.randomSite();
        this.snakes[0].length = 2;
        this.snakes[0].dead = false;
        this.snakes[0].tail = [];
    }

    update() {
        let snake = this.snakes[0];

        let next = this.next_site(snake.head, snake.headDirection);

        // copy
        snake.tail.push({x: snake.head.x, y: snake.head.y});

        if (this.isEating(snake)) {
            snake.length += 1;
            this.add_food();
        }

        while (snake.tail.length >= snake.length + 1) {
            snake.tail.shift();
        }

        if (this.isWall(next) || this.isOccupied(next)) {
            snake.dead = true;
        }

        snake.head = next;

        if(snake.dead) {
            this.reset();
        }
    }

}

class Ai extends React.Component {

    constructor(props) {
        super(props);

        const game = new JsGameState(10, 10);

        this.state = {
            scale: 20,
            foodColor: "#cc2200",
            bgColor: "#000",
            game: game
        };

        this.model_promise = null;
    }

    componentDidMount() {
        this.model_promise = tf.loadLayersModel('models/snakeConvPPO_e24000/model.json');
        this.refresh = setInterval(_ => this.step(), 30);
    }

    componentWillUnmount() {
        clearInterval(this.refresh);
    }

    step() {
        this.model_promise.then(model => {
            let action = model.predict(tf.tensor([this.state.game.trainingBitmap()]));
            action = action[0].argMax(1).arraySync()[0];
            this.state.game.absoluteAction2Move(action);
            this.state.game.update();

            this.setState({game: this.state.game});
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
                            sx={{ mx: "auto" }}
                            focused={_ => {}}
                        />
                    </Grid>
                </Grid>
            </Container>
        )
    }
}

export default Ai
