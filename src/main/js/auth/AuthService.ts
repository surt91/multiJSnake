import axios from "axios";

// adapted from https://www.bezkoder.com/react-jwt-auth/

const API_URL = "/api/auth/";

const csrf_meta = document.querySelector("meta[name='_csrf']");
const csrf_header_meta = document.querySelector("meta[name='_csrf_header']");
if (csrf_meta !== null && csrf_header_meta !== null) {
    // @ts-ignore
    const csrf_token = csrf_meta.content;
    // @ts-ignore
    const csrf_header = csrf_header_meta.content;
    // @ts-ignore
    axios.defaults.headers.post[csrf_header] = csrf_token;
}

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
