import React, {useState} from "react";
import {Box, TextField, Tooltip} from "@mui/material";

type Props = {
    link: string
}

export default function ShareLink(props: Props) {

    const [tooltip, setTooltip] = useState("Click to copy")

    return (
        <Box>
            <h4>Share this for others to join</h4>
            <Tooltip title={tooltip}>
                <TextField
                    variant="outlined"
                    label="sharable link"
                    value={props.link}
                    onClick={() => {
                        navigator.clipboard.writeText(props.link);
                        setTooltip("Copied!")
                    }}
                    onMouseLeave={() => setTooltip("Click to copy")}
                    onChange={e => e.preventDefault()}
                />
            </Tooltip>
        </Box>
    );
}
