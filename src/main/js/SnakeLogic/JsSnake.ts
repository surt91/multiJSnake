export type Coordinate = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

class JsSnake {
    public tail: Coordinate[];
    public length: number;
    public head: Coordinate;
    public headDirection: Direction;
    public dead: Boolean;
    public idx: number;

    // properties not needed for this class but present in the server response
    public name: string;
    
    constructor(head: Coordinate) {
        this.tail = [];
        this.length = 2;
        this.head = head;
        this.headDirection = "up";
        this.dead = false;
        this.idx = 0;

        this.name = "Anonymous";
    }
}

export default JsSnake