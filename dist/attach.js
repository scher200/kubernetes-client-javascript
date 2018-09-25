"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
const web_socket_handler_1 = require("./web-socket-handler");
class Attach {
    constructor(config) {
        this.handler = new web_socket_handler_1.WebSocketHandler(config);
    }
    attach(namespace, podName, containerName, stdout, stderr, stdin, tty) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                stdout: stdout != null,
                stderr: stderr != null,
                stdin: stdin != null,
                tty,
                container: containerName,
            };
            const queryStr = querystring.stringify(query);
            const path = `/api/v1/namespaces/${namespace}/pods/${podName}/attach?${queryStr}`;
            const conn = yield this.handler.connect(path, null, (streamNum, buff) => {
                web_socket_handler_1.WebSocketHandler.handleStandardStreams(streamNum, buff, stdout, stderr);
            });
            if (stdin != null) {
                web_socket_handler_1.WebSocketHandler.handleStandardInput(conn, stdin);
            }
            return conn;
        });
    }
}
exports.Attach = Attach;
//# sourceMappingURL=attach.js.map
