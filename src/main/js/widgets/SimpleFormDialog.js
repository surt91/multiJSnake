import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import React from "react";
import PropTypes from "prop-types";

class SimpleFormDialog extends React.Component {
    constructor(props) {
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
                <Button {...this.props.button} onClick={e => this.handleClickOpen(e)}>
                    {this.props.buttonText}
                </Button>
                <Dialog open={this.state.open} onClose={e => this.handleClose(e)}>
                    <DialogTitle>{this.props.buttonText}</DialogTitle>
                    <form onSubmit={this.props.formik.handleSubmit}>
                        <DialogContent>
                            {this.props.fields}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={e => this.handleClose(e)}>Cancel</Button>
                            <Button type="submit">Submit</Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </>
        );
    }
}

SimpleFormDialog.propTypes = {
    formik: PropTypes.object,
    open: PropTypes.bool,
    buttonText: PropTypes.string,
    fields: PropTypes.object
};

export default SimpleFormDialog
