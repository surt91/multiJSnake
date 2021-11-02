import React from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PropTypes from "prop-types";

class AddAutopilot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.defaultValue || null};
    }

    setValue(newValue) {
        this.setState({
            value: newValue
        })
    }

    render() {
        return (
            <Stack spacing={2}>
                <Autocomplete
                    disablePortal
                    id={"aiChooser"}
                    options={this.props.aiOptions}
                    sx={{ width: this.props.width || 250 }}
                    value={this.state.value}
                    renderInput={(params) => <TextField {...params} label="AI Strategy" />}
                    onChange={(e, newValue) => {
                        this.setValue(newValue);
                        this.props.onChange && newValue && this.props.onChange(newValue)
                    }}
                />
                <Box sx={{ width: this.props.width || 250 }}>
                    {this.state.value && this.state.value.description}
                </Box>
                {this.props.commitMode &&
                <Button
                    aria-label="done"
                    disabled={this.state.value === null}
                    onClick={_ => this.state.value && this.props.onCommit(this.state.value)}
                    variant="outlined"
                >
                    {this.props.submitText || "Add Autopilot"}
                    <AddIcon/>
                </Button>
                }
            </Stack>
        );
    }
}

AddAutopilot.propTypes = {
    onCommit: PropTypes.func,
    aiOptions: PropTypes.array
}

export default AddAutopilot