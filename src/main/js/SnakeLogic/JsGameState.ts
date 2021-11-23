import JsSnake, {Coordinate, Direction} from "./JsSnake";

export interface SnakeMap {
    [propName: number]: JsSnake;
}

/// implementation of the same logic as on the server side (but only for a single snake
/// this is useful to let it run at a higher framerate client-side (currently for demoing the autopilot)
class JsGameState {
    public readonly width: number;
    public readonly height: number;
    public food: { x: number; y: number } | null;
    public readonly snakes: SnakeMap;

    // properties not needed for this class but present in the server response
    public paused: boolean;
    public gameOver: boolean;

    private gameOverCallback?: (score: number) => void;
    private delay_ctr: number;

    constructor(width: number, height: number, gameOverCallback?: (score: number) => void) {
        this.width = width;
        this.height = height;
        this.food = {x: -1, y: -1};
        this.snakes = {0: new JsSnake({x: 0, y: 0})};
        this.paused = false;
        this.gameOver = false;

        this.gameOverCallback = gameOverCallback;
        this.delay_ctr = 0;

        this.reset();
    }

    // TODO: do something better, a hashmap or bitmap, or something
    isOccupied(site: Coordinate) {
        const {x, y} = site;
        return Object.values(this.snakes).some(
            snake => snake.tail.some(
                (site: Coordinate) => site.x === x && site.y === y
            )
        );
    }

    isWall(site: Coordinate) {
        const {x, y} = site;
        return x < 0 || x >= this.width || y < 0 || y >= this.height;
    }

    isEating(snake: JsSnake) {
        return this.food && snake.head.x === this.food.x && snake.head.y === this.food.y;
    }

    checkPerfectGame() {
        const occupied_fields = this.snakes[0].length + 1;  // +1 for the head
        return occupied_fields === this.width * this.height - 1; // -1 to place new food
    }

    randomSite() {
        if(this.checkPerfectGame())
            return null;

        let site;
        do {
            site = {x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height)};
        } while (this.isOccupied(site));
        return site;
    }

    add_food() {
        this.food = this.randomSite();
        // in case of a perfect game
        // if(this.food === null) {
        //     this.food = {x: -1, y: -1};
        // }
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

        // after a perfect game, there is no food on the field
        if(this.food !== null) {
            state[this.food.x][this.food.y][0] = 1;
        }
        // the head can be outside of the field (after collision with a wall)
        if(!this.isWall(snake.head)) {
            state[snake.head.x][snake.head.y][1] = 1;
        }

        let ctr = 1;
        for(let site of snake.tail) {
            state[site.x][site.y][2] = ctr;
            ctr += 1;
        }

        return state;
    }

    /// get the state of the game
    /// here we just take up to third nearest neighbor fields of the snake's head
    /// 1: snake/wall
    /// 0: free
    /// and in which direction the food is
    /// 0/1: its in front
    /// 0/1: its left
    /// 0/1: its right
    trainingState() {
        const snake = this.snakes[0];
        let state = [];

        const rad = this.food === null ? 0 : this.angle(snake.head, snake.headDirection, this.food);
        const eps = 1e-6;

        // is food in front?
        if (Math.abs(rad) < Math.PI / 2 - eps) {
            state.push(1);
        } else {
            state.push(0);
        }

        // is food left?
        if (rad > eps && rad < Math.PI - eps) {
            state.push(1);
        } else {
            state.push(0);
        }

        // is food right?
        if (rad < -eps && rad > -Math.PI + eps) {
            state.push(1);
        } else {
            state.push(0);
        }

        // is food behind?
        if (Math.abs(rad) > Math.PI/2. + eps) {
            state.push(1);
        } else {
            state.push(0);
        }

        // first neighbors
        const straight = this.next_site(snake.head, snake.headDirection);
        const left = this.next_site(snake.head, this.rLeft(snake.headDirection));
        const right = this.next_site(snake.head, this.rRight(snake.headDirection));
        const back = this.next_site(snake.head, this.back(snake.headDirection));
        state.push(this.danger(left));
        state.push(this.danger(straight));
        state.push(this.danger(right));
        // omit back, its always occupied

        // second neighbors
        const lb = this.next_site(left, this.back(snake.headDirection));
        const ls = this.next_site(left, snake.headDirection);
        const rs = this.next_site(right, snake.headDirection);
        const rb = this.next_site(right, this.back(snake.headDirection));
        state.push(this.danger(lb));
        state.push(this.danger(ls));
        state.push(this.danger(rs));
        state.push(this.danger(rb));

        // third neighbors
        const ll = this.next_site(left, this.rLeft(snake.headDirection));
        const ss = this.next_site(straight, snake.headDirection);
        const rr = this.next_site(right, this.rRight(snake.headDirection));
        const bb = this.next_site(back, this.back(snake.headDirection));
        state.push(this.danger(ll));
        state.push(this.danger(ss));
        state.push(this.danger(rr));
        state.push(this.danger(bb));

        return state;
    }

    danger(site: Coordinate) {
        if(this.isOccupied(site) || this.isWall(site))
            return 1;
        return 0;
    }

    angle(subject: Coordinate, direction: Direction, object: Coordinate) {
        let rad;
        const dx = object.x - subject.x;
        const dy = object.y - subject.y;

        // apply coordinate rotation, such that the snake always looks to the right
        // from the point of view of the atan
        // also note that our coordinate system grows down, so up points to lower values of y
        switch (direction) {
            case "right":
                rad = -Math.atan2(dy, dx);
                break;
            case "up":
                rad = Math.atan2(-dx, -dy);
                break;
            case "left":
                rad = -Math.atan2(-dy, -dx);
                break;
            case "down":
                rad = Math.atan2(dx, dy);
                break;
        }

        return rad;
    }

    relativeAction2Move(action: number) {
        const snake = this.snakes[0];
        switch(action) {
            case 0:
                // left
                snake.headDirection = this.rLeft(snake.headDirection);
                break;
            case 1:
                // straight
                break;
            case 2:
                // right
                snake.headDirection = this.rRight(snake.headDirection);
                break;
        }
    }

    absoluteAction2Move(action: number) {
        const snake = this.snakes[0];
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

    next_site(site: Coordinate, direction: Direction) {
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

    rLeft(direction: Direction) {
        switch(direction) {
            case "up":
                return "left";
            case "down":
                return "right";
            case "left":
                return "down";
            case "right":
                return "up";
        }
    }

    rRight(direction: Direction) {
        switch(direction) {
            case "up":
                return "right";
            case "down":
                return "left";
            case "left":
                return "up";
            case "right":
                return "down";
        }
    }

    back(direction: Direction) {
        switch(direction) {
            case "up":
                return "down";
            case "down":
                return "up";
            case "left":
                return "right";
            case "right":
                return "left";
        }
    }

    reset() {
        this.snakes[0].length = 2;
        this.snakes[0].dead = false;
        this.snakes[0].tail = [];

        const newHead = this.randomSite();
        if(newHead === null) {
            throw "perfect game during reset is impossible"
        }

        this.snakes[0].head =  newHead;
        this.add_food();
    }

    update() {
        const snake = this.snakes[0];
        if(!snake.dead && !this.checkPerfectGame()) {

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
        } else {
            this.delay_ctr += 1;
            if(this.delay_ctr >= 30) {
                const score = this.checkPerfectGame() ? this.width*this.height : snake.tail.length;
                this.gameOverCallback && this.gameOverCallback(score);
                this.reset();
                this.delay_ctr = 0;
            }
        }
    }
}

export default JsGameState