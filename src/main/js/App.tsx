import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import {GameView} from "./widgets/GameView";
import Profile, {User} from "./widgets/Profile";
import Ai from "./widgets/Ai";
import NavBar from "./NavBar";
import AuthService from "./auth/AuthService";

// make sure to use https, otherwise the copy to clipboard will not work
if (location.protocol !== 'https:' && location.hostname !== "localhost") {
    location.replace(`https:${location.href.substring(location.protocol.length)}`);
}

function App() {
    const [currentUser, setCurrentUser] = useState<User|undefined>(undefined);

    useEffect(() => setCurrentUser(AuthService.getCurrentUser()), [])

    return(
        <BrowserRouter>
            <NavBar
                section={"MultiJSnake"}
                onUserChange={() => setCurrentUser(AuthService.getCurrentUser())}
                currentUser={currentUser}
            />
            <Switch>
                {/*@skip-for-static-start*/}
                <Route exact path={["/", "/game"]}>
                    <GameView
                        currentUser={currentUser}
                    />
                </Route>
                <Route exact path={["/profile"]} component={Profile} />
                {/*@skip-for-static-end*/}
                <Route exact path={["/ai"]} component={Ai} />
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)