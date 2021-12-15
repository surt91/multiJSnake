import axios from "axios";

// adapted from https://www.bezkoder.com/react-jwt-auth/

const API_URL = "/api/auth/";

// @ts-ignore
const csrf_token = document.querySelector("meta[name='_csrf']").content;
// @ts-ignore
const csrf_header = document.querySelector("meta[name='_csrf_header']").content;
// @ts-ignore
axios.defaults.headers.post[csrf_header] = csrf_token;

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
