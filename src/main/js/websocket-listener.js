import {Client} from "@stomp/stompjs";

// https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
export const registerStomp = (subscriptions) => {
    let websocketProtocol;
    if(location.protocol === 'https:') {
        websocketProtocol = "wss";
    } else {
        websocketProtocol = "ws";
    }

    const client = new Client({
        brokerURL: websocketProtocol + '://' + window.location.host + '/dynamic',
        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 300,
    });
    client.buffer = []

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

    client.bufferedPublish = msg => {
        if(!client.connected) {
            client.buffer.push(msg);
        } else {
            client.publish(msg);
        }
    }

    client.sendBuffer = () => {
        for(let msg of client.buffer) {
            client.publish(msg);
        }
    }

    return client;
}
