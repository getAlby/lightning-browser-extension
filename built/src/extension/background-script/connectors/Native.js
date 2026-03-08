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
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const nativeApplication = "alby";
function Native(Base) {
    return class extends Base {
        get port() {
            if (this._port) {
                return this._port;
            }
            else {
                this.connectNativeCompanion();
                return this._port;
            }
        }
        connectNativeCompanion() {
            this._port = webextension_polyfill_1.default.runtime.connectNative(nativeApplication);
            // Add status listener
            // If the native app sends an error (e.g. Tor failed) we simply try to restart for now.
            // Sadly we do not have any way to notify the user from here
            this._port.onMessage.addListener((response) => {
                if (response.id !== "status") {
                    return;
                }
                // TODO: test this
                if (response.status === 502 && response.header["X-Alby-Internal"]) {
                    console.error("Error in the native companion. Shutting it down");
                    console.error(response);
                    this.unload();
                }
            });
            this._port.onDisconnect.addListener((p) => {
                console.error("Native companion disconnected");
                if (p.error) {
                    console.error(`Native companion error: ${p.error.message}`);
                }
                this._port = null;
            });
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this._port) {
                    this.connectNativeCompanion();
                }
            });
        }
        unload() {
            return new Promise((resolve, reject) => {
                if (this._port) {
                    this._port.disconnect(); // stop the native companion app
                    this._port = null;
                    setTimeout(resolve, 5000); // we wait for 2 seconds for the native app to shut down. Sadly we do not know when exactly it exited
                }
                else {
                    resolve();
                }
            });
        }
    };
}
exports.default = Native;
