import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React from "react";

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

type State = {
    open: boolean
}

class SimpleFormDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {open: false};
    }

    handleClickOpen() {
        this.setState({open: true});
    };

    handleClose() {
        this.setState({open: false});
        this.props.formik.resetForm();
    };

    render() {
        return (
            <>
                <Button {...this.props.button} onClick={() => this.handleClickOpen()}>
                    {this.props.buttonText}
                </Button>
                <Dialog open={this.state.open} onClose={() => this.handleClose()}>
                    <DialogTitle>{this.props.buttonText}</DialogTitle>
                    <form onSubmit={this.props.formik.handleSubmit}>
                        <DialogContent>
                            {this.props.fields}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose()}>Cancel</Button>
                            <Button type="submit">Submit</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </>
        );
    }
}

export default SimpleFormDialog
