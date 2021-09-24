'use strict';

const SockJS = require('sockjs-client');
require('stompjs');

export const registerStompPromise = (registrations) => {
    return new Promise((resolve, _reject) => {
        const socket = SockJS('/dynamic');
        let stompClient = Stomp.over(socket);
        stompClient.connect({}, (_frame) => {
            registrations.forEach((registration) => {
                stompClient.subscribe(registration.route, registration.callback);
            });
            resolve(stompClient);
        });
    })
}