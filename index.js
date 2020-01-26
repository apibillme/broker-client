import { parseChunkToStringEvent, parseStringEventToObject, } from './utils';

class BrokerClient {
    constructor(url, init) {
        this.readState = BrokerClient.CONNECTING;
        this.controller = new AbortController();
        this.listeners = [];
        this.stringMessagesQueue = [];
        const signal = this.controller.signal;
        // TODO: Make sure header is always text/event-stream
        fetch(url, Object.assign({ signal }, init))
            .then((response) => {
            // There is no body 🤷
            if (!response.body)
                throw new Error('No body');
            // get that reader
            this.reader = response.body.getReader();
            this.start(this.reader);
        })
            .catch(error => {
            console.error(error);
            throw error;
        });
    }
    _onOpen() {
        this.readState = BrokerClient.OPEN;
        this.onopen && this.onopen(new Event('open'));
    }
    _onClosed() {
        this.readState = BrokerClient.CLOSED;
        this.onclose && this.onclose();
    }
    _onMessage(objectEvent) {
        // save last knows ID
        objectEvent.id &&
            objectEvent.id !== '' &&
            (this.lastEventID = objectEvent.id);
        // creat new MessageEvent
        const messageEvent = new MessageEvent(objectEvent.event, {
            data: objectEvent.data,
            lastEventId: this.lastEventID,
        });
        // call onmessage if exist
        this.onmessage && this.onmessage(messageEvent);
        // call eventListener if exists
        this.listeners[objectEvent.event] &&
            this.newMethod(objectEvent)(messageEvent);
    }
    newMethod(objectEvent) {
        return this.listeners[objectEvent.event];
    }
    async start(reader) {
        // this is where we're putting all parse event
        while (true) {
            const { done, value } = await reader.read();
            this._onOpen();
            // We're done, stop loop
            if (done) {
                this._onClosed();
                break;
            }
            // re-glue chunks into string messages, but before,
            // let's pass back the previous incomplete messages
            const filteredQueue = this.stringMessagesQueue.filter(m => !m.complete);
            this.stringMessagesQueue = parseChunkToStringEvent(value, filteredQueue.length > 0 ? filteredQueue : undefined);
            // now we need to parse those complete strings into objects
            // and do the onMessage stuff
            this.stringMessagesQueue
                .filter(m => m.complete)
                .map(m => parseStringEventToObject(m.message))
                .forEach(m => {
                this._onMessage(m);
            });
        }
        // when we're done, close the stream
        reader.releaseLock();
    }
    close() {
        this.reader.cancel();
    }
    addEventListener(eventType, callback) {
        this.listeners[eventType] = callback;
    }
    removeEventListener(eventType) {
        delete this.listeners[eventType];
    }
}
BrokerClient.CONNECTING = 0;
BrokerClient.OPEN = 1;
BrokerClient.CLOSED = 2;
export default BrokerClient;
