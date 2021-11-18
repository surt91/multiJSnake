import React from "react";

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

type State = {}

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
class Canvas extends React.Component<Props, State> {
    private readonly canvasRef: React.RefObject<HTMLCanvasElement>;

    constructor(props: Props) {
        super(props);

        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;

        if(canvas === null) {
            throw "Canvas failed to construct";
        }

        // prevent scrolling so that we can use touch events of navigation
        canvas.style.cssText = "touch-action: none;";
        this.context = canvas.getContext('2d');
        this.props.draw(this.context);
        canvas.focus();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const canvas = this.canvasRef.current;

        if(canvas === null) {
            throw "Canvas failed to construct";
        }

        const context = canvas.getContext('2d');

        if(context === null) {
            throw "Failed to get the Context of the constructed canvas";
        }

        this.props.draw(context);
    }

    render() {
        let {draw, focused, ...passthrough} = this.props;
        return (
            // @ts-ignore
            <canvas
                ref={this.canvasRef}
                {...passthrough}
                id={"snakeCanvas"}
                tabIndex={-1}
                onBlur={_ => focused(false)}
                onFocus={_ => focused(true)}
            />
        )
    }
}

export default Canvas
