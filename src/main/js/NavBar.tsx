import React from "react";
import {NavLink} from "react-router-dom";

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import FastForwardIcon from '@mui/icons-material/FastForward';
import AuthService from "./auth/AuthService";
import axios from "axios";
import authHeader from "./auth/authHeader";
import LoginDialog from "./widgets/LoginDialog";
import RegisterDialog from "./widgets/RegisterDialog";
import {User} from "./widgets/Profile";

type Props = {
    currentUser?: User,
    onUserChange: () => void,
    section: string
}
type State = {}

// TODO: this navbar also handles logic for expiring logins... that is not very clean
export class NavBar extends React.Component<Props, State> {
    private interval?: number;

    constructor(props: Props) {
        super(props);

        this.state = {path: "/"};

        this.testJwt();
    }

    // test if we have a token and whether it is still valid
    // if not we log out
    testJwt() {
        if (AuthService.getCurrentUser()) {
            const header = authHeader();
            header && axios.get('/api/user/profile', { headers: header })
                .then(/* token is valid, we do not have to do anything */)
                .catch(_ => {AuthService.logout(); this.props.onUserChange()});
        }
    }

    // also test every hour (the JWT are only good for a limited amount of time
    componentDidMount() {
        this.interval = window.setInterval(() => this.testJwt(), 60*60*1000);
        this.setState({path: location.pathname})
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render() {
        return(
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ marginRight: "3em" }}>
                            {this.props.section}
                        </Typography>

                        {/*@skip-for-static-start*/}
                        <NavLink to="/" className={"navlink"}>
                            <Button color="inherit" startIcon={<SportsEsportsIcon />}>
                                Game
                            </Button>
                        </NavLink>

                        {this.props.currentUser &&
                        <NavLink to="/profile" className={"navlink"}>
                            <Button color="inherit" startIcon={<PersonIcon />}>
                                Profile
                            </Button>
                        </NavLink>
                        }

                        <NavLink to="/ai" className={"navlink"}>
                            <Button color="inherit" startIcon={<FastForwardIcon />}>
                                AI
                            </Button>
                        </NavLink>
                        {/*@skip-for-static-end*/}

                        <Button
                            color="inherit"
                            href={"https://github.com/surt91/multiJSnake"}
                            startIcon={<GitHubIcon />}
                        >
                            GitHub
                        </Button>

                        {/*@skip-for-static-start*/}
                        {this.props.currentUser &&
                        <Button color="inherit" startIcon={<LogoutIcon />} onClick={_ => {
                            AuthService.logout();
                            this.props.onUserChange()

                        }}>
                            Logout
                        </Button>
                        }
                        {!this.props.currentUser &&
                        <LoginDialog
                            buttonText={"Login"}
                            button={{color:"inherit", startIcon:<LoginIcon />}}
                            authService={AuthService}
                            onSuccess={_ => this.props.onUserChange()}
                        />
                        }
                        {!this.props.currentUser &&
                        <RegisterDialog
                            buttonText={"Register"}
                            button={{color:"inherit"}}
                            authService={AuthService}
                            onSuccess={_ => this.props.onUserChange()}
                        />
                        }
                        {/*@skip-for-static-end*/}
                    </Toolbar>
                </AppBar>
            </Box>
        );
    }
}


