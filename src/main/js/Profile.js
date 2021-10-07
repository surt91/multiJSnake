import React from "react";
import authHeader from "./authHeader";
import axios from "axios";

// https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user: undefined
        }

        this.getUserData()
    }

    getUserData() {
        console.log("get user data");
        console.log(authHeader());
        axios.get('/api/user/profile', { headers: authHeader() })
            .then(response => this.setState({user: response.data}))
            .catch(_ => this.setState({user: undefined}));
    }

    render() {
        return (
            <>
                {this.state.user ? <>
                    <p>Hi {this.state.user.username}!</p>
                    <p>Your email is '{this.state.user.email}'</p>
                </> :
                    <p>Your are not logged in!</p>
                }
            </>
        )
    }
}

export default Profile
