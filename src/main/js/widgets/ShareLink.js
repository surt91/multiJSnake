import React from "react";
import {Box, TextField, Tooltip} from "@mui/material";
import PropTypes from "prop-types";

class ShareLink extends React.Component {
    constructor(props) {
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

ShareLink.propTypes = {
    link: PropTypes.string
}

export default ShareLink