import React from "react";
import authHeader from "../auth/authHeader";
import axios from "axios";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {Score} from "./Scores";

type UserScore = {
    id: string,
    score: number,
    date: Date,
    fieldSize: number
}

export type User = {
    username: string,
    email: string
}

type Props = {
    title: string
}

type State = {
    user?: User,
    highscores: Score[]
}

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
class Profile extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            highscores: [],
            user: undefined
        };
    }

    componentDidMount() {
        this.getUserData();
    }

    getUserFailed() {
        this.setState({user: undefined})
    }

    getUserData() {
        const header = authHeader();
        if(header === null) {
            return this.getUserFailed();
        }

        axios.get('/api/user/profile', { headers: header })
            .then(response => this.setState({user: response.data}))
            .catch(_ => this.getUserFailed());

        axios.get('/api/user/highscore', { headers: header })
            .then((response: any) =>
                response.data.map((h: UserScore) =>
                    <TableRow key={h.id}>
                        <TableCell>{h.score}</TableCell>
                        <TableCell>{new Date(h.date).toLocaleDateString()}, {new Date(h.date).toLocaleTimeString()}</TableCell>
                        <TableCell>{h.fieldSize}</TableCell>
                    </TableRow>
            ))
            .then(element => this.setState({highscores: element}))
            .catch(_ => this.getUserFailed());
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
