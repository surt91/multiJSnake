import React from "react";
import authHeader from "./authHeader";
import axios from "axios";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: undefined
        };
    }

    componentDidMount() {
        this.getUserData();
    }

    getUserData() {
        console.log("get user data");
        console.log(authHeader());
        axios.get('/api/user/profile', { headers: authHeader() })
            .then(response => this.setState({user: response.data}))
            .catch(_ => this.setState({user: undefined}));

        axios.get('/api/user/highscore', { headers: authHeader() })
            .then(response =>
                response.data.map(h =>
                    <TableRow key={h.id}>
                        <TableCell>{h.score}</TableCell>
                        <TableCell>{new Date(h.date).toLocaleDateString()}, {new Date(h.date).toLocaleTimeString()}</TableCell>
                        <TableCell>{h.fieldSize}</TableCell>
                    </TableRow>
            ))
            .then(element => this.setState({highscores: element}))
            .catch(_ => this.setState({user: undefined}));
    }

    render() {
        return (
            <>
                {this.state.user ? <>
                    <p>Hi {this.state.user.username}!</p>
                    <p>Your email is '{this.state.user.email}'</p>
                    <p>Your Highscores</p>
                    <TableContainer component={Paper}>
                        <Table aria-label={this.props.title} id="highscores">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Score</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Field Size</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.highscores}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </> :
                    <p>Your are not logged in!</p>
                }
            </>
        )
    }
}

export default Profile
