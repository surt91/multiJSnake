import BufferedStompClient from "./BufferedStompClient";

type Subscription = {
    route: string,
    callback: (message: WebsocketMessage) => void
}

export type WebsocketMessage = {
    body: string
}

// https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
export const registerStomp = (subscriptions: Subscription[]) => {
    let websocketProtocol;
    if(location.protocol === 'https:') {
        websocketProtocol = "wss";
    } else {
        websocketProtocol = "ws";
    }

    const client = new BufferedStompClient({
        brokerURL: websocketProtocol + '://' + window.location.host + '/dynamic',
        debug: function (str: string) {
            console.log(str);
        },
        reconnectDelay: 300,
    });

    client.onConnect = _frame => {
        subscriptions.map(subscription =>
            client.subscribe(subscription.route, subscription.callback)
        );
        client.sendBuffer();
    };

    client.onStompError = frame => {
        console.log('Broker reported error: ' + frame.headers['message']);
        console.log('Additional details: ' + frame.body);
    };

    client.activate();

    return client;
}
