import * as yup from "yup";
import {useFormik} from "formik";
import {Stack, TextField} from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import SimpleFormDialog from "./SimpleFormDialog";

const RegisterDialog = (props) => {

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
                    if(errors.response.status === 400) {
                        formik.setErrors(errors.response.data);
                    }
                });
        }
    });

    const fields = <Stack spacing={2}>
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
    </Stack>

    return(
        <SimpleFormDialog
            fields={fields}
            formik={formik}
            buttonText={props.buttonText}
            button={props.button}
        />
    )
}

RegisterDialog.propTypes = {
    authService: PropTypes.any,
    onSuccess: PropTypes.func,
    buttonText: PropTypes.string,
    button: PropTypes.object
}

export default RegisterDialog