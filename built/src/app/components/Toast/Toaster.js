"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_hot_toast_1 = require("react-hot-toast");
function Toaster() {
    return ((0, jsx_runtime_1.jsx)(react_hot_toast_1.Toaster, { position: "bottom-center", toastOptions: {
            duration: 4000,
        } }));
}
exports.default = Toaster;
