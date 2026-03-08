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
const lnbits_1 = __importDefault(require("./lnbits"));
const NativeConnector = (0, Native_1.default)(lnbits_1.default);
class NativeLnBits extends NativeConnector {
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
    request(method, path, apiKey, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body;
            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            };
            if (method === "POST") {
                body = JSON.stringify(args);
            }
            const url = new URL(this.config.url);
            url.pathname = path;
            const reqConfig = {
                id: path,
                method,
                url: url.toString(),
                headers,
                body,
            };
            let data;
            try {
                const res = yield this._nativeRequest(reqConfig);
                data = JSON.parse(res.body);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    throw new Error(e.message);
            }
            return data;
        });
    }
}
exports.default = NativeLnBits;
