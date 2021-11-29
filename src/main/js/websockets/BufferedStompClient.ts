import {Client} from "@stomp/stompjs";
import {StompConfig} from "@stomp/stompjs/src/stomp-config";
import {IPublishParams} from "@stomp/stompjs/src/types";

export default class BufferedStompClient extends Client {
    private readonly buffer: IPublishParams[];

    constructor(config: StompConfig) {
        super(config);

        this.buffer = []
    }

    bufferedPublish(msg: IPublishParams) {
        if(!this.connected) {
            this.buffer.push(msg);
        } else {
            this.publish(msg);
        }
    }

    sendBuffer() {
        for(let msg of this.buffer) {
            this.publish(msg);
        }
    }
}
