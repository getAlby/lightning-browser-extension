"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLNURLDetailsError = void 0;
const isLNURLDetailsError = (res) => {
    return "status" in res && res.status.toUpperCase() === "ERROR";
};
exports.isLNURLDetailsError = isLNURLDetailsError;
