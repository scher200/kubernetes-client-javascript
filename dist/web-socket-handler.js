"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
const ws = require("websocket");
const protocols = [
    'v4.channel.k8s.io',
    'v3.channel.k8s.io',
    'v2.channel.k8s.io',
    'channel.k8s.io',
];
class WebSocketHandler {
    constructor(config) {
        this.config = config;
    }
    static handleStandardStreams(streamNum, buff, stdout, stderr) {
        if (buff.length < 1) {
            return null;
        }
        if (streamNum === WebSocketHandler.StdoutStream) {
            stdout.write(buff);
        }
        else if (streamNum === WebSocketHandler.StderrStream) {
            stderr.write(buff);
        }
        else if (streamNum === WebSocketHandler.StatusStream) {
            // stream closing.
            if (stdout) {
                stdout.end();
            }
            if (stderr) {
                stderr.end();
            }
            return JSON.parse(buff.toString('utf8'));
        }
        else {
            throw new Error('Unknown stream: ' + stream);
        }
        return null;
    }
    static handleStandardInput(conn, stdin) {
        stdin.on('data', (data) => {
            const buff = Buffer.from(data, data.length + 1);
            buff.writeInt8(0, 0);
            if (data instanceof Buffer) {
                data.copy(buff, 1);
            }
            else {
                buff.write(data, 1);
            }
            conn.send(buff);
        });
        stdin.on('end', () => {
            conn.close();
        });
    }
    connect(path, textHandler, binaryHandler) {
        const server = this.config.getCurrentCluster().server;
        const ssl = server.startsWith('https://');
        const target = ssl ? server.substr(8) : server.substr(7);
        const proto = ssl ? 'wss' : 'ws';
        const uri = `${proto}://${target}${path}`;
        const opts = {};
        // TODO: This doesn't set insecureSSL if skipTLSVerify is set...
        this.config.applytoHTTPSOptions(opts);
        const client = new ws.client({ tlsOptions: opts });
        return new Promise((resolve, reject) => {
            client.on('connect', (connection) => {
                connection.on('message', (message) => {
                    if (message.type === 'utf8') {
                        if (textHandler) {
                            textHandler(message.utf8Data);
                        }
                    }
                    else if (message.type === 'binary') {
                        if (binaryHandler) {
                            const streamNum = message.binaryData.readInt8(0);
                            binaryHandler(streamNum, message.binaryData.slice(1));
                        }
                    }
                });
                resolve(connection);
            });
            client.on('connectFailed', (err) => {
                reject(err);
            });
            client.connect(uri, protocols);
        });
    }
}
WebSocketHandler.StdinStream = 0;
WebSocketHandler.StdoutStream = 1;
WebSocketHandler.StderrStream = 2;
WebSocketHandler.StatusStream = 3;
exports.WebSocketHandler = WebSocketHandler;
//# sourceMappingURL=web-socket-handler.js.map