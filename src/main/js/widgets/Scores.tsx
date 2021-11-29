import React from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import ColorViewer from "./ColorViewer";

export type Score = {
    idx: number,
    playerName: string,
    score: number,
    color: string
}

type Props = {
    scores: Score[],
    title: string
}

export default function Scores(props: Props) {
    const fields = props.scores.map((score, index) =>
        <TableRow key={score.playerName + index.toString()}>
            <TableCell>
                <ColorViewer color={score.color}/>
            </TableCell>
            <TableCell>
                {score.playerName}
            </TableCell>
            <TableCell>
                {score.score}
            </TableCell>
        </TableRow>
    );

    return (
        <>
            <h2>{props.title}</h2>
            <TableContainer component={Paper}>
                <Table aria-label={props.title} id="currentScores">
                    <TableBody>
                        {fields}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}
