"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const byline_1 = require("byline");
const request = require("request");
class Watch {
    constructor(config) {
        this.config = config;
    }
    watch(path, queryParams, callback, done) {
        const url = this.config.getCurrentCluster().server + path;
        queryParams.watch = true;
        const headerParams = {};
        const requestOptions = {
            method: 'GET',
            qs: queryParams,
            headers: headerParams,
            uri: url,
            useQuerystring: true,
            json: true,
        };
        this.config.applyToRequest(requestOptions);
        const stream = new byline_1.LineStream();
        stream.on('data', (data) => {
            let obj = null;
            if (data instanceof Buffer) {
                obj = JSON.parse(data.toString());
            }
            else {
                obj = JSON.parse(data);
            }
            if (obj.type && obj.object) {
                callback(obj.type, obj.object);
            }
            else {
                throw new Error(`unexpected object: ${obj}`);
            }
        });
        const req = request(requestOptions, (error, response, body) => {
            if (error) {
                done(error);
            }
            done(null);
        });
        req.pipe(stream);
        return req;
    }
}
exports.Watch = Watch;
//# sourceMappingURL=watch.js.map