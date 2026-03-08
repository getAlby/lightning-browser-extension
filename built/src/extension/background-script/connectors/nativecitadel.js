"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Native_1 = __importDefault(require("./Native"));
const citadel_1 = __importDefault(require("./citadel"));
const NativeConnector = (0, Native_1.default)(citadel_1.default);
class NativeCitadel extends NativeConnector {
    _nativeRequest(postMessage) {
        return new Promise((resolve, reject) => {
            const handler = (response) => {
                if (response.id !== postMessage.id) {
                    return;
                }
                this.port.onMessage.removeListener(handler);
                // TODO: think how to handle errors
                if (response.status > 299) {
                    reject(new Error(response.body));
                }
                else {
                    resolve(response);
                }
            };
            this.port.onMessage.addListener(handler);
            this.port.postMessage(postMessage);
        });
    }
    request(method, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body;
            let headers = {};
            path = this.config.url + (this.config.url.endsWith("/") ? "" : "/") + path;
            if (method !== "GET") {
                headers = {
                    "Content-type": "application/json",
                };
            }
            if (this.jwt)
                headers = Object.assign(Object.assign({}, headers), { Authorization: `JWT ${this.jwt}` });
            if (method === "POST") {
                body = JSON.stringify(args);
            }
            const response = yield this._nativeRequest({
                headers,
                url: path,
                method: method || "GET",
                id: path + Math.floor(Math.random() * 1000 + 1).toString(),
                body,
            });
            if (response.status !== 200) {
                throw new Error(response.body);
            }
            const data = response.body;
            let parsed;
            try {
                parsed = JSON.parse(data);
            }
            catch (_a) {
                throw new Error(`Received invalid data: ${data}`);
            }
            if (typeof parsed === "string") {
                throw new Error(parsed);
            }
            return parsed;
        });
    }
}
exports.default = NativeCitadel;
