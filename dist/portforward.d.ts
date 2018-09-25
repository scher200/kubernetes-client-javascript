/// <reference types="node" />
import stream = require('stream');
import ws = require('websocket');
import { KubeConfig } from './config';
import { WebSocketHandler } from './web-socket-handler';
export declare class PortForward {
    'handler': WebSocketHandler;
    constructor(config: KubeConfig);
    portForward(namespace: string, podName: string, ports: number[], output: stream.Writable | any, err: stream.Writable | any, input: stream.Readable | any): Promise<ws.connection>;
}
