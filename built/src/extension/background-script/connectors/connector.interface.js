"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenRequestMethods = void 0;
function flattenRequestMethods(methods) {
    return methods.map((method) => `request.${method}`);
}
exports.flattenRequestMethods = flattenRequestMethods;
