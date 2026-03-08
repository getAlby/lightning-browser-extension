"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Native_1 = __importDefault(require("./Native"));
const lnd_1 = __importDefault(require("./lnd"));
const NativeConnector = (0, Native_1.default)(lnd_1.default);
class NativeLnd extends NativeConnector {
    request(method, path, args) {
        const url = new URL(this.config.url);
        url.pathname = path;
        let body = "";
        const headers = {};
        headers["Accept"] = "application/json";
        if (method === "POST") {
            body = JSON.stringify(args);
            headers["Content-Type"] = "application/json";
        }
        else if (args !== undefined) {
            url.search = new URLSearchParams(args).toString();
        }
        if (this.config.macaroon) {
            headers["Grpc-Metadata-macaroon"] = this.config.macaroon;
        }
        return new Promise((resolve, reject) => {
            const handler = (response) => {
                if (response.id !== path) {
                    return;
                }
                this.port.onMessage.removeListener(handler);
                // TODO: think how to handle errors
                if (response.status > 299) {
                    reject(new Error(response.body));
                }
                else {
                    const data = JSON.parse(response.body);
                    resolve(data);
                }
            };
            this.port.onMessage.addListener(handler);
            this.port.postMessage({
                id: path,
                method,
                url: url.toString(),
                body,
                headers,
            });
        });
    }
}
exports.default = NativeLnd;
