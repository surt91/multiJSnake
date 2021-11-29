import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React, {useState} from "react";

export type ButtonProps = {
    color?: "inherit",
    startIcon?: JSX.Element
}

type Props = {
    formik: any,
    buttonText: string,
    fields: JSX.Element,
    button: ButtonProps
}

export default function SimpleFormDialog(props: Props) {

    const [open, setOpen] = useState(false);

    function handleClickOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        props.formik.resetForm();
    }

    return (
        <>
            <Button {...props.button} onClick={() => handleClickOpen()}>
                {props.buttonText}
            </Button>
            <Dialog open={open} onClose={() => handleClose()}>
                <DialogTitle>{props.buttonText}</DialogTitle>
                <form onSubmit={props.formik.handleSubmit}>
                    <DialogContent>
                        {props.fields}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleClose()}>Cancel</Button>
                        <Button type="submit">Submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}
