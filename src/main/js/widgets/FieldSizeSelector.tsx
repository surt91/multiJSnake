// TODO: rewrite with formik
import React, {useState} from "react";
import {Button, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

type Props = {
    onCommit: (width: number, height: number) => void,
    gameWidth: number,
    gameHeight: number
}

export default function FieldSizeSelector(props: Props) {
    const [width, setWidth] = useState(props.gameWidth);
    const [height, setHeight] = useState(props.gameHeight);

    return (
        <Stack spacing={2}>
            <TextField
                type="number"
                label="width"
                name="width"
                value={width}
                onChange={e => setWidth(parseInt(e.target.value))}
            />
            <TextField
                type="number"
                label="height"
                name="height"
                value={height}
                onChange={e => setHeight(parseInt(e.target.value))}
            />
            <Button
                aria-label="done"
                onClick={_ => props.onCommit(width, height)}
                variant="outlined"
            >
                new game
                <DoneIcon />
            </Button>
        </Stack>
    );
}
