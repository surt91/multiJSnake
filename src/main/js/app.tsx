import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import {GameView} from "./widgets/GameView";
import Profile, {User} from "./widgets/Profile";
import Ai from "./widgets/Ai";
import {NavBar} from "./NavBar";
import AuthService from "./auth/AuthService";

// make sure to use https, otherwise the copy to clipboard will not work
if (location.protocol !== 'https:' && location.hostname !== "localhost") {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

type Props = {};

type State = {
    currentUser?: User
};

class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {currentUser: undefined};
    }

    updateCurrentUser() {
        this.setState({currentUser: AuthService.getCurrentUser()})
    }

    componentDidMount() {
        this.updateCurrentUser();
    }

    render() {
        return(
            <BrowserRouter>
                <NavBar
                    section={"MultiJSnake"}
                    onUserChange={() => this.updateCurrentUser()}
                    currentUser={this.state.currentUser}
                />
                <Switch>
                    <Route exact path={["/", "/game"]}>
                        <GameView
                            currentUser={this.state.currentUser}
                        />
                    </Route>
                    <Route exact path={["/profile"]} component={Profile} />
                    <Route exact path={["/ai"]} component={Ai} />
                </Switch>
            </BrowserRouter>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)