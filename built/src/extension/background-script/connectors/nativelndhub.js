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
const lndhub_1 = __importDefault(require("./lndhub"));
const NativeConnector = (0, Native_1.default)(lndhub_1.default);
class NativeLndHub extends NativeConnector {
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
    authorize() {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
            };
            const url = new URL(this.config.url);
            url.pathname = "/auth";
            const params = { type: "auth" };
            const body = JSON.stringify({
                login: this.config.login,
                password: this.config.password,
            });
            return this._nativeRequest({
                id: "auth",
                method: "POST",
                url: url.toString(),
                body,
                params,
                headers,
            }).then((response) => {
                const json = JSON.parse(response.body);
                if (json && json.error) {
                    throw new Error("API error: " + json.message + " (code " + json.code + ")");
                }
                if (!json.access_token || !json.refresh_token) {
                    throw new Error("API unexpected response: " + JSON.stringify(json));
                }
                this.refresh_token = json.refresh_token;
                this.access_token = json.access_token;
                this.refresh_token_created = +new Date();
                this.access_token_created = +new Date();
                return json;
            });
        });
    }
    request(method, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.access_token) {
                yield this.authorize();
            }
            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.access_token}`,
            };
            const url = new URL(this.config.url);
            url.pathname = path;
            let body;
            let params;
            if (method === "POST") {
                body = JSON.stringify(args);
            }
            else {
                params = args;
            }
            const reqConfig = {
                id: path,
                method,
                url: url.toString(),
                headers,
                body,
                params,
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
            if (data && data.error) {
                if (data.code * 1 === 1 && !this.noRetry) {
                    try {
                        yield this.authorize();
                    }
                    catch (e) {
                        console.error(e);
                        if (e instanceof Error)
                            throw new Error(e.message);
                    }
                    this.noRetry = true;
                    return this.request(method, path, args);
                }
                else {
                    throw new Error(data.message);
                }
            }
            return data;
        });
    }
}
exports.default = NativeLndHub;
