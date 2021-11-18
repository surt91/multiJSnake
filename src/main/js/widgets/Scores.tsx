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

type State = {}

class Scores extends React.Component<Props, State> {
    render() {
        const fields = this.props.scores.map((score, index) =>
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
                <h2>{this.props.title}</h2>
                <TableContainer component={Paper}>
                    <Table aria-label={this.props.title} id="currentScores">
                        <TableBody>
                            {fields}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        )
    }
}

export default Scores