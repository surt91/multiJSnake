import React from "react";
import { Link } from "react-router-dom";

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton, Grid
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu";
import AuthService from "./AuthService";
import {LoginDialog, RegisterDialog} from "./formDialog";
import axios from "axios";
import authHeader from "./authHeader";


// TODO: this navbar also handles logic for expiring logins... that is not very clean
export class NavBar extends React.Component {
    constructor(props) {
        super(props);

        this.testJwt();
    }

    // test if we have a token and whether it is still valid
    // if not we log out
    testJwt() {
        if (AuthService.getCurrentUser()) {
            axios.get('/api/user/profile', { headers: authHeader() })
                .then(/* token is valid, we do not have to do anything */)
                .catch(_ => {AuthService.logout(); this.props.onUserChange()});
        }
    }

    // also test every hour (the JWT are only good for a limited amount of time
    componentDidMount() {
        this.interval = setInterval(() => this.testJwt(), 60*60*1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return(
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {this.props.section}
                        </Typography>
                        {this.props.currentUser ?
                            <Grid container spacing={2}>
                                <Grid item>
                                    <Button variant="outlined" onClick={_ => {AuthService.logout(); this.props.onUserChange()}}>
                                        {"Logout"}
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Link to="/profile">
                                        <Button variant="outlined">
                                            {"Profile"}
                                        </Button>
                                    </Link>
                                </Grid>
                            </Grid>
                            :
                            <Grid container spacing={2}>
                                <Grid item>
                                    <LoginDialog
                                        buttonText={"Login"}
                                        authService={AuthService}
                                        onSuccess={_ => this.props.onUserChange()}
                                    />
                                </Grid>
                                <Grid item>
                                    <RegisterDialog
                                        buttonText={"Register"}
                                        authService={AuthService}
                                        onSuccess={_ => this.props.onUserChange()}
                                    />
                                </Grid>
                            </Grid>
                        }
                    </Toolbar>
                </AppBar>
            </Box>
        );
    }
}


