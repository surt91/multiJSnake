import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@material-ui/core";
import React from "react";

export class SimpleFormDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false};
    }

    handleClickOpen() {
        this.setState({open: true});
    };

    handleClose() {
        this.setState({open: false});
    };

    handleSubmit() {
        this.handleClose()
    };

    render() {
        return (
            <div>
                <Button variant="outlined" onClick={e => this.handleClickOpen(e)}>
                    {this.props.buttonText}
                </Button>
                <Dialog open={this.state.open} onClose={e => this.handleClose(e)}>
                    <DialogTitle>{this.props.buttonText}</DialogTitle>
                    <form method="POST" action={this.props.endpoint}>
                        <DialogContent>
                            {this.props.fields}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={e => this.handleClose(e)}>Cancel</Button>
                            <Button type={"submit"} onClick={e => this.handleSubmit(e)}>Submit</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </div>
        );
    }
}