'use strict';

const SockJS = require('sockjs-client');
require('stompjs');

export function registerStomp(registrations) {
    const socket = SockJS('/dynamic');
    let stompClient = Stomp.over(socket);
    stompClient.connect({}, function(frame) {
        registrations.forEach(function (registration) {
            stompClient.subscribe(registration.route, registration.callback);
        });
    });
    return stompClient;
}
