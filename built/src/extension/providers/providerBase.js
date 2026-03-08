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
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const postMessage_1 = require("~/extension/providers/postMessage");
class ProviderBase {
    constructor(scope) {
        this._scope = scope;
        this._isEnabled = false;
        this._eventEmitter = new events_1.EventEmitter();
        this._scope = scope;
    }
    _checkEnabled(methodName) {
        if (!this._isEnabled) {
            throw new Error(`Provider must be enabled before calling ${methodName}`);
        }
    }
    enable() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isEnabled) {
                return;
            }
            const result = yield this.execute("enable");
            if (typeof result.enabled === "boolean") {
                this._isEnabled = result.enabled;
            }
        });
    }
    on(...args) {
        this._checkEnabled("on");
        this._eventEmitter.on(...args);
    }
    off(...args) {
        this._checkEnabled("off");
        this._eventEmitter.off(...args);
    }
    emit(...args) {
        this._eventEmitter.emit(...args);
    }
    isEnabled() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isEnabled) {
                return true;
            }
            const result = yield this.execute("isEnabled");
            if (typeof result.isEnabled === "boolean") {
                this._isEnabled = result.isEnabled;
            }
            return this._isEnabled;
        });
    }
    // NOTE: new call `action`s must be specified also in the content script
    execute(action, args) {
        return (0, postMessage_1.postMessage)(this._scope, action, args);
    }
}
exports.default = ProviderBase;
