'use strict';

import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";

export const registerStompPromise = (registrations) => {
    return new Promise((resolve, _reject) => {
        const socket = SockJS('/dynamic');
        let stompClient = Stomp.over(socket);
        stompClient.connect({}, (_frame) => {
            // https://stackoverflow.com/a/43430736
            const sessionId = /\/([^\/]+)\/websocket/.exec(socket._transport.url)[1];
            const subscriptions = registrations.map(registration =>
                stompClient.subscribe(registration.route, registration.callback)
            );
            stompClient.sessionId = sessionId;
            stompClient.unsubscribeAll = () => subscriptions.forEach(sub => sub.unsubscribe())
            resolve(stompClient);
        });
    })
}