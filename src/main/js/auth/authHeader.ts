type AuthorisationHeader = {
    Authorization: string
}

export default function authHeader(): AuthorisationHeader | null {
    const loadedUser = localStorage.getItem('user');
    const user = loadedUser && JSON.parse(loadedUser);

    if (user && user.accessToken) {
        return { Authorization: 'Bearer ' + user.accessToken };
    } else {
        return null;
    }
}
