'use strict';

const SockJS = require('sockjs-client');
require('stompjs');

export const registerStompPromise = (registrations) => {
    return new Promise((resolve, _reject) => {
        const socket = SockJS('/dynamic');
        let stompClient = Stomp.over(socket);
        stompClient.connect({}, (_frame) => {
            // https://stackoverflow.com/a/43430736
            const sessionId = /\/([^\/]+)\/websocket/.exec(socket._transport.url)[1];
            registrations.forEach((registration) => {
                stompClient.subscribe(registration.route, registration.callback);
            });
            stompClient.sessionId = sessionId;
            resolve(stompClient);
        });
    })
}