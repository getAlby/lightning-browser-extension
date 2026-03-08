"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOS() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1)
        return "Windows";
    if (userAgent.indexOf("Mac") !== -1)
        return "MacOS";
    if (userAgent.indexOf("X11") !== -1)
        return "UNIX";
    if (userAgent.indexOf("Android") !== -1)
        return "Android";
    if (userAgent.indexOf("Linux") !== -1)
        return "Linux";
}
exports.default = getOS;
