/// <reference types="node" />
import stream = require('stream');
import { KubeConfig } from './config';
import { WebSocketHandler } from './web-socket-handler';
export declare class Attach {
    'handler': WebSocketHandler;
    constructor(config: KubeConfig);
    attach(namespace: string, podName: string, containerName: string, stdout: stream.Writable | any, stderr: stream.Writable | any, stdin: stream.Readable | any, tty: boolean): Promise<void>;
}
