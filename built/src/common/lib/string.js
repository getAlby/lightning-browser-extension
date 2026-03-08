"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.base64DecodeUnicode = void 0;
// https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
function base64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map
        .call(atob(str), function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    })
        .join(""));
}
exports.base64DecodeUnicode = base64DecodeUnicode;
