import React from "react";
import {Box} from "@mui/material";

type Props = {
    color: string
}

export default function ColorViewer(props: Props) {
    return (
        <Box sx={{
            width: 20,
            height: 20,
            bgcolor: props.color
        }}/>
    );
}
