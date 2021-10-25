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

export default JsSnake