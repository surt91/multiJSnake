import React from "react";
import {Box, TextField, Tooltip} from "@mui/material";

type Props = {
    link: string
}

type State = {
    tooltip: string
}


class ShareLink extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            tooltip: "Click to copy"
        }
    }

    render() {
        return (
            <Box>
                <h4>Share this for others to join</h4>
                <Tooltip title={this.state.tooltip}>
                    <TextField
                        variant="outlined"
                        label="sharable link"
                        value={this.props.link}
                        onClick={() => {
                            navigator.clipboard.writeText(this.props.link);
                            this.setState({tooltip: "Copied!"})
                        }}
                        onMouseLeave={() => this.setState({
                            tooltip: "Click to copy"
                        })}
                        onChange={e => e.preventDefault()}
                    />
                </Tooltip>
            </Box>
        );
    }
}

export default ShareLink