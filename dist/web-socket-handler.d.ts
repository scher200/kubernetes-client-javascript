/// <reference types="node" />
import stream = require('stream');
import ws = require('websocket');
import { V1Status } from './api';
import { KubeConfig } from './config';
export declare class WebSocketHandler {
    static readonly StdinStream: number;
    static readonly StdoutStream: number;
    static readonly StderrStream: number;
    static readonly StatusStream: number;
    static handleStandardStreams(streamNum: number, buff: Buffer, stdout: any, stderr: any): V1Status;
    static handleStandardInput(conn: ws.connection, stdin: stream.Readable | any): void;
    'config': KubeConfig;
    constructor(config: KubeConfig);
    connect(path: string, textHandler: (text: string) => void, binaryHandler: (stream: number, buff: Buffer) => void): Promise<ws.connection>;
}
