import React, {memo, useState} from "react";
import {Autocomplete, Box, Button, Stack, TextField} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {AiOption} from "./Ai";

type Props = {
    onCommit: (value: AiOption) => void,
    onChange?: (value: AiOption) => void,
    aiOptions: AiOption[]
    width?: number | string,
    defaultValue?: AiOption,
    commitMode: boolean,
    submitText?: string
}

function AddAutopilot(props: Props) {
    const [value, setValue] = useState(props.defaultValue || null) // if this was undefined, the input would be uncontrolled

    return (
        <Stack spacing={2}>
            <Autocomplete
                disablePortal
                id={"aiChooser"}
                options={props.aiOptions}
                sx={{ width: props.width || 250 }}
                value={value}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="AI Strategy" />}
                onChange={(e, newValue) => {
                    newValue && setValue(newValue);
                    props.onChange && newValue && props.onChange(newValue)
                }}
            />
            {props.commitMode &&
            <Button
                aria-label="done"
                disabled={value === null}
                onClick={_ => value && props.onCommit(value)}
                variant="outlined"
            >
                {props.submitText || "Add Autopilot"}
                <AddIcon/>
            </Button>
            }
            <Box sx={{ width: props.width || 250 }}>
                {value && value.description}
            </Box>
        </Stack>
    );
}

export default memo(AddAutopilot);
