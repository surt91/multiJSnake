import React, {useEffect, useState} from "react";
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

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
export default function Profile(props: Props) {

    const [highscores, setHighscores] = useState<Score[]>([]);
    const [user, setUser] = useState<User|undefined>(undefined);

    useEffect(() => getUserData(), []);

    function getUserFailed() {
        setUser(undefined)
    }

    function getUserData() {
        const header = authHeader();
        if(header === null) {
            return getUserFailed();
        }

        axios.get('/api/user/profile', { headers: header })
            .then(response => setUser(response.data))
            .catch(_ => getUserFailed());

        axios.get('/api/user/highscore', { headers: header })
            .then((response: any) =>
                response.data.map((h: UserScore) =>
                    <TableRow key={h.id}>
                        <TableCell>{h.score}</TableCell>
                        <TableCell>{new Date(h.date).toLocaleDateString()}, {new Date(h.date).toLocaleTimeString()}</TableCell>
                        <TableCell>{h.fieldSize}</TableCell>
                    </TableRow>
            ))
            .then(element => setHighscores(element))
            .catch(_ => getUserFailed());
    }

    return (
        <>
            {user ? <>
                <p>Hi {user.username}!</p>
                <p>Your email is '{user.email}'</p>
                <p>Your Highscores</p>
                <TableContainer component={Paper}>
                    <Table aria-label={props.title} id="highscores">
                        <TableHead>
                            <TableRow>
                                <TableCell>Score</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Field Size</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {highscores}
                        </TableBody>
                    </Table>
                </TableContainer>
            </> :
                <p>Your are not logged in!</p>
            }
        </>
    )
}
