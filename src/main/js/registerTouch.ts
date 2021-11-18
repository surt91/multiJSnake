// steering using touch gestures
import {Direction} from "./SnakeLogic/JsSnake";

let xDown: number | null = null;
let yDown: number | null = null;

export function registerTouch(move: (dir: Direction) => void, unpause: () => void) {
    document.ontouchstart = function (evt) {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
    };

    document.ontouchmove = function (evt) {
        if (!xDown || !yDown) {
            return;
        }

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        // only handle the event, if the swipe started or ended in the canvas
        // FIXME: this is an ugly hardcoded id
        const c = document.getElementById("snakeCanvas");
        if(c === null) {
            return;
        }

        const r = c.getBoundingClientRect();
        if (
            xUp - r.left > 0
            && yUp - r.top > 0
            && xUp - r.right < 0
            && yUp - r.bottom < 0
            || xDown - r.left > 0
            && yDown - r.top > 0
            && xDown - r.right < 0
            && yDown - r.bottom < 0) {
            // we are inside, just pass
        } else {
            // do not steer if the event was outside
            return;
        }

        const xDiff = xDown - xUp;
        const yDiff = yDown - yUp;

        // which component is longer
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                move("left");
            } else {
                move("right");
            }
        } else {
            if (yDiff > 0) {
                move("up");
            } else {
                move("down");
            }
        }

        unpause();

        xDown = null;
        yDown = null;
    };
}



