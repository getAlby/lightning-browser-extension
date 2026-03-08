"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const notify = (options) => {
    const settings = state_1.default.getState().settings;
    if (!settings.browserNotifications)
        return;
    const notification = Object.assign({ type: "basic", iconUrl: "../assets/icons/alby_icon_yellow_48x48.png" }, options);
    return webextension_polyfill_1.default.notifications.create(notification);
};
exports.notify = notify;
