import React from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {AiOption} from "./Ai";

type Props = {
    onCommit: (value: AiOption) => void,
    onChange?: (value: AiOption) => void,
    aiOptions: AiOption[]
    width?: number,
    defaultValue?: AiOption,
    commitMode: boolean,
    submitText?: string
}

type State = {
    value: AiOption | null
}

class AddAutopilot extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: this.props.defaultValue || null  // if this was undefined, the input would be uncontrolled
        };
    }

    setValue(newValue: AiOption) {
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
                        newValue && this.setValue(newValue);
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

export default AddAutopilot