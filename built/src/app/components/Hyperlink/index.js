"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("~/app/utils");
function Hyperlink({ onClick, children, href, className, target, rel, }) {
    return ((0, jsx_runtime_1.jsx)("a", { className: (0, utils_1.classNames)("cursor-pointer text-blue-600 hover:text-blue-700", className !== null && className !== void 0 ? className : ""), href: href, onClick: onClick, target: target, rel: rel, children: children }));
}
exports.default = Hyperlink;
