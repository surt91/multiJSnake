import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@material-ui/core";
import React from "react";
import {useFormik} from 'formik';
import * as yup from "yup";
import PropTypes from "prop-types";

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
        this.props.formik.resetForm();
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

SimpleFormDialog.propTypes = {
    formik: PropTypes.object,
    open: PropTypes.bool,
    buttonText: PropTypes.string,
    fields: PropTypes.object
};

export const LoginDialog = (props) => {

    const validationSchemaLogin = yup.object({
        username: yup
            .string('Enter your username')
            .required('Email is required'),
        password: yup
            .string('Enter your password')
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: validationSchemaLogin,
        onSubmit: (values) => {
            props.authService.login(values.username, values.password)
                .then(_response => {
                    props.onSuccess(values);
                })
                .catch(errors => {
                    if(errors.response.status === 400) {
                        formik.setErrors(errors.response.data);
                    }
                    // user does not exists, the password is wrong or it is not authorized to login (banned, ...)
                    if(errors.response.status === 401) {
                        formik.setErrors({
                            "username": "The user does not exist ...",
                            "password": "... or the password is wrong"
                        });
                    }
                });
        }
    });

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
            fields={fields}
            formik={formik}
            buttonText={props.buttonText}
        />
    )
}

LoginDialog.propTypes = {
    authService: PropTypes.any,
    onSuccess: PropTypes.func,
    buttonText: PropTypes.string
}


export const RegisterDialog = (props) => {

    const validationSchemaRegister = yup.object({
        email: yup
            .string('Enter your email')
            .email('Enter a valid email')
            .required('Email is required'),
        username: yup
            .string('Enter your username')
            .min(3, 'Username should be of minimum 3 characters length')
            .required('Email is required'),
        password: yup
            .string('Enter your password')
            .min(8, 'Password should be of minimum 8 characters length')
            .required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
        },
        validationSchema: validationSchemaRegister,
        onSubmit: (values) => {
            props.authService.register(values.username, values.email, values.password)
                .then(_response => {
                    props.onSuccess(values);
                })
                .catch(errors => {
                    console.log(errors);
                    if(errors.response.status === 400) {
                        formik.setErrors(errors.response.data);
                    }
                });
        }
    });

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
            fields={fields}
            formik={formik}
            buttonText={props.buttonText}
        />
    )
}

LoginDialog.propTypes = {
    authService: PropTypes.any,
    onSuccess: PropTypes.func,
    buttonText: PropTypes.string
}