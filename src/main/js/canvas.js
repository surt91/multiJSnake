const React = require('react');

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
class Canvas extends React.Component {

    constructor(props) {
        super(props);

        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        // prevent scrolling so that we can use touch events of navigation
        canvas.style.cssText = "touch-action: none;";
        this.context = canvas.getContext('2d');
        this.props.draw(this.context);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const canvas = this.canvasRef.current;
        const context = canvas.getContext('2d');
        this.props.draw(context);
    }

    render() {
        let {draw, ...passthrough} = this.props;
        return (
            <canvas ref={this.canvasRef} {...passthrough}/>
        )
    }
}

export default Canvas
