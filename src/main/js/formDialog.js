import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@material-ui/core";
import React from "react";
import axios from "axios";
import { useFormik } from 'formik';

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
        this.props.formik.resetForm()
    };

    render() {
        return (
            <div>
                <Button variant="outlined" onClick={e => this.handleClickOpen(e)}>
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
            </div>
        );
    }
}


export const LoginDialog = (props) => {
    const formik = useFormik({
        initialValues: {
            email: '',
            username: '',
            password: '',
        },
        validationSchema: props.validationSchema,
        onSubmit: (values) => {
            axios.post(props.endpoint, values)
                .then(response => {
                    console.log("yay", response);
                    props.onSuccess(values);
                    dialogRef.current.handleClose();
                })
                .catch(errors => {
                    console.log("nay", errors);
                    if(errors.response.status === 400) {
                        formik.setErrors(errors.response.data);
                    }
                });
        }
    });

    const dialogRef = React.useRef(null);

    const fields = <>
        <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
        />
    </>

    return(
        <SimpleFormDialog
            ref={dialogRef}
            fields={fields}
            formik={formik}
            buttonText={props.buttonText}
            endpoint={props.endpoint}
        />
    )
}


export const RegisterDialog = (props) => {
    const formik = useFormik({
        initialValues: {
            email: '',
            username: '',
            password: '',
        },
        validationSchema: props.validationSchema,
        onSubmit: (values) => {
            axios.post(props.endpoint, values)
                .then(response => {
                    console.log("yay", response);
                    props.onSuccess(values);
                    dialogRef.current.handleClose();
                })
                .catch(errors => {
                    console.log("nay", errors, values);
                    if(errors.response.status === 400) {
                        formik.setErrors(errors.response.data);
                    }
                });
        }
    });

    const dialogRef = React.useRef(null);

    const fields = <>
        <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
        />
        <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
        />
    </>

    return(
        <SimpleFormDialog
            ref={dialogRef}
            fields={fields}
            formik={formik}
            buttonText={props.buttonText}
            endpoint={props.endpoint}
        />
    )
}