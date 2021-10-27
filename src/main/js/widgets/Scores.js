import React from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import PropTypes from "prop-types";
import ColorViewer from "./ColorViewer";

class Scores extends React.Component {
    constructor(props) {
        super(props);
    }

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

Scores.propTypes = {
    scores: PropTypes.array,
    title: PropTypes.string
}

export default Scores