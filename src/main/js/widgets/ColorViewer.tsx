import React from "react";
import {Box} from "@mui/material";

type Props = {
    color: string
}

type State = {}

class ColorViewer extends React.Component<Props, State> {
    render() {
        return (
            <Box sx={{
                width: 20,
                height: 20,
                bgcolor: this.props.color
            }}/>
        );
    }
}

export default ColorViewer