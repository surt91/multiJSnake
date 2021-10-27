import React from "react";
import {IconButton, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import RevertIcon from "@mui/icons-material/NotInterestedOutlined";
import EditIcon from "@mui/icons-material/Edit";
import PropTypes from "prop-types";
import ColorViewer from "./ColorViewer";

// TODO: rewrite with formik
class PlayerName extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editMode: false,
            previous: props.name
        }

        this.onToggleEditMode = this.onToggleEditMode.bind(this);
        this.onRevert = this.onRevert.bind(this);
        this.onAccept = this.onAccept.bind(this);
    }

    onToggleEditMode() {
        this.setState((state, props) => ({
            editMode: !state.editMode,
            previous: props.name
        }));
    };

    onRevert() {
        this.props.onChange(this.state.previous);
        this.onToggleEditMode();
    };

    onAccept() {
        this.props.onCommit(this.props.name);
        this.onToggleEditMode();
    };

    render() {
        return(
            <Stack spacing={2}>
                <h4>You are:</h4>
                <Stack spacing={2} direction={"row"} alignItems={"center"}>
                    <ColorViewer color={this.props.color}/>
                    <div id={"playerNameView"}>
                        {this.state.editMode ? (
                            <TextField
                                value={this.props.name}
                                name="name"
                                label="Player Name"
                                onChange={e => this.props.onChange(e.target.value)}
                            />
                        ) : (
                            this.props.name
                        )}
                    </div>

                    {!this.props.loggedIn && this.state.editMode &&
                    <IconButton
                        aria-label="done"
                        onClick={this.onAccept}
                    >
                        <DoneIcon/>
                    </IconButton>
                    }
                    {!this.props.loggedIn && this.state.editMode &&
                    <IconButton
                        aria-label="revert"
                        onClick={this.onRevert}
                    >
                        <RevertIcon/>
                    </IconButton>
                    }
                    {!this.props.loggedIn && !this.state.editMode &&
                    <IconButton
                        aria-label="edit"
                        onClick={this.onToggleEditMode}
                    >
                        <EditIcon/>
                    </IconButton>
                    }
                </Stack>
            </Stack>
        );
    }
}

PlayerName.propTypes = {
    loggedIn: PropTypes.bool,
    name: PropTypes.string,
    color: PropTypes.string,
    onChange: PropTypes.func
}

export default PlayerName