import React from "react";
import {Box} from "@mui/material";
import PropTypes from "prop-types";

class ColorViewer extends React.Component {
    constructor(props) {
        super(props);
    }

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

ColorViewer.propTypes = {
    color: PropTypes.string
}

export default ColorViewer