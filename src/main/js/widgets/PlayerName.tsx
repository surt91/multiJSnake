import React, {useState} from "react";
import {IconButton, Stack, TextField} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import RevertIcon from "@mui/icons-material/NotInterestedOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ColorViewer from "./ColorViewer";

type Props = {
    loggedIn: boolean,
    name: string,
    color: string,
    onChange: (value: string) => void
    onCommit: (value: string) => void
}

export default function PlayerName(props: Props) {

    const [editMode, setEditMode] = useState(false);
    const [previous, setPrevious] = useState(props.name);

    function onToggleEditMode() {
        setEditMode(!editMode);
        setPrevious(props.name);
    }

    function onRevert() {
        props.onChange(previous);
        onToggleEditMode();
    }

    function onAccept() {
        props.onCommit(props.name);
        onToggleEditMode();
    }

    return(
        <Stack spacing={2}>
            <h4>You are:</h4>
            <Stack spacing={2} direction={"row"} alignItems={"center"}>
                <ColorViewer color={props.color}/>
                <div id={"playerNameView"}>
                    {editMode ? (
                        <TextField
                            value={props.name}
                            name="name"
                            label="Player Name"
                            onChange={e => props.onChange(e.target.value)}
                        />
                    ) : (
                        props.name
                    )}
                </div>

                {!props.loggedIn && editMode &&
                <IconButton
                    aria-label="done"
                    onClick={onAccept}
                >
                    <DoneIcon/>
                </IconButton>
                }
                {!props.loggedIn && editMode &&
                <IconButton
                    aria-label="revert"
                    onClick={onRevert}
                >
                    <RevertIcon/>
                </IconButton>
                }
                {!props.loggedIn && !editMode &&
                <IconButton
                    aria-label="edit"
                    onClick={onToggleEditMode}
                >
                    <EditIcon/>
                </IconButton>
                }
            </Stack>
        </Stack>
    );
}
