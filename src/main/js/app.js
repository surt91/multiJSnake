import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

import {GameView} from "./GameView";
import Profile from "./Profile";
import {NavBar} from "./NavBar";
import AuthService from "./AuthService";

// make sure to use https, otherwise the copy to clipboard will not work
if (location.protocol !== 'https:' && location.hostname !== "localhost") {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {currentUser: undefined};
    }

    updateCurrentUser() {
        this.setState({currentUser: AuthService.getCurrentUser()})
        if(Boolean(this.state.currentUser)) {
            this.handleNameCommit(this.state.currentUser.username)
        }
    }

    componentDidMount() {
        this.updateCurrentUser();
    }

    render() {
        return(
            <BrowserRouter>
                <NavBar
                    section={"MultiJSnake"}
                    onUserChange={_ => this.updateCurrentUser()}
                    currentUser={this.state.currentUser}
                />
                <Switch>
                    <Route exact path={["/", "/game"]}>
                        <GameView
                            currentUser={this.state.currentUser}
                        />
                    </Route>
                    <Route exact path={["/profile"]} component={Profile} />
                </Switch>
            </BrowserRouter>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)