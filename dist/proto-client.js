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
const http = require("http");
const url = require("url");
class ProtoClient {
    get(msgType, requestPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = this.config.getCurrentCluster().server;
            const u = new url.URL(server);
            const options = {
                path: requestPath,
                hostname: u.hostname,
                protocol: u.protocol,
            };
            this.config.applytoHTTPSOptions(options);
            const req = http.request(options);
            const result = new Promise((resolve, reject) => {
                let data = '';
                req.on('data', (chunk) => {
                    data = data + chunk;
                });
                req.on('end', () => {
                    const obj = msgType.deserializeBinary(data);
                    resolve(obj);
                });
                req.on('error', (err) => {
                    reject(err);
                });
            });
            req.end();
            return result;
        });
    }
}
exports.ProtoClient = ProtoClient;
//# sourceMappingURL=proto-client.js.map