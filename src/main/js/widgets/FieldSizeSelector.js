// TODO: rewrite with formik
import React from "react";
import {Button, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import PropTypes from "prop-types";

class FieldSizeSelector extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.gameWidth,
            height: this.props.gameHeight
        }

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <Stack spacing={2}>
                <TextField
                    type="number"
                    label="width"
                    name="width"
                    value={this.state.width}
                    onChange={this.onChange}
                />
                <TextField
                    type="number"
                    label="height"
                    name="height"
                    value={this.state.height}
                    onChange={this.onChange}
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

FieldSizeSelector.propTypes = {
    onCommit: PropTypes.func,
    gameWidth: PropTypes.number,
    gameHeight: PropTypes.number
}

export default FieldSizeSelector