import axios from "axios";

// adapted from https://www.bezkoder.com/react-jwt-auth/

const API_URL = "/api/auth/";

class AuthService {
    login(username: string, password: string) {
        return axios
            .post(API_URL + "login", {
                username,
                password
            })
            .then(response => {
                // @ts-ignore
                if (response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response;
            });
    }

    logout() {
        localStorage.removeItem("user");
    }

    register(username: string, email: string, password: string) {
        return axios.post(API_URL + "register", {
            username,
            email,
            password
        })
        // also login on success
            .then(() => this.login(username, password));
    }

    getCurrentUser() {
        const savedUser = localStorage.getItem('user')
        return savedUser && JSON.parse(savedUser);
    }
}

export default new AuthService();
