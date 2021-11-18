// TODO: rewrite with formik
import React from "react";
import {Button, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

type Props = {
    onCommit: (width: number, height: number) => void,
    gameWidth: number,
    gameHeight: number
}

type State = {
    width: number,
    height: number
}

class FieldSizeSelector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            width: this.props.gameWidth,
            height: this.props.gameHeight
        }
    }

    setWidth(width: number) {
        this.setState({
            width: width,
        })
    }

    setHeight(height: number) {
        this.setState({
            height: height,
        })
    }

    render() {
        return (
            <Stack spacing={2}>
                <TextField
                    type="number"
                    label="width"
                    name="width"
                    value={this.state.width}
                    onChange={e => this.setWidth(parseInt(e.target.value))}
                />
                <TextField
                    type="number"
                    label="height"
                    name="height"
                    value={this.state.height}
                    onChange={e => this.setHeight(parseInt(e.target.value))}
                />
                <Button
                    aria-label="done"
                    onClick={_ => this.props.onCommit(this.state.width, this.state.height)}
                    variant="outlined"
                >
                    new game
                    <DoneIcon />
                </Button>
            </Stack>
        );
    }
}

export default FieldSizeSelector