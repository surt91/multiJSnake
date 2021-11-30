import React, {useEffect, useRef} from "react";

type Props = {
    width: number,
    height: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
    focused: (b: Boolean) => void,
    // style from MUI
    sx?: any,
    tabIndex?: number,
    onKeyDown?: (e: KeyboardEvent) => void
};

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
export default function Canvas(props: Props) {
    const canvasRef = useRef<HTMLCanvasElement|null>(null);

    const {draw, focused, ...passthrough} = props;

    useEffect(() => {
        const canvas = canvasRef.current;

        if(canvas === null) {
            throw "Canvas failed to construct";
        }

        canvas.focus();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;

        if(canvas === null) {
            throw "Canvas failed to construct";
        }

        const context = canvas.getContext('2d');

        if(context === null) {
            throw "Failed to get the Context of the constructed canvas";
        }

        draw(context);
    });

    return (
        // @ts-ignore
        <canvas
            ref={canvasRef}
            {...passthrough}
            id={"snakeCanvas"}
            tabIndex={-1}
            onBlur={_ => focused(false)}
            onFocus={_ => focused(true)}
        />
    )
}
