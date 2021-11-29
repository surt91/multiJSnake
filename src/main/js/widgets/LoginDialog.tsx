import * as yup from "yup";
import {useFormik} from "formik";
import {Stack, TextField} from "@mui/material";
import React from "react";
import SimpleFormDialog, {ButtonProps} from "./SimpleFormDialog";
import AuthService from "../auth/AuthService";

type Value = {
    username: string,
    password: string,
}

type Props = {
    authService: typeof AuthService,
    onSuccess: (value: Value) => void,
    buttonText: string,
    button: ButtonProps
}

export default function LoginDialog(props: Props) {

    const validationSchemaLogin = yup.object({
        username: yup
            // @ts-ignore
            .string('Enter your username')
            .required('Email is required'),
        password: yup
            // @ts-ignore
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
                .then((_response: any) => {
                    props.onSuccess(values);
                })
                .catch((errors: any) => {
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

    const fields = <Stack spacing={2}>
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
