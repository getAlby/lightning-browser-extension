"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function ContentMessage({ heading, content }) {
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("dl", { className: "my-4 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("dt", { className: "text-sm text-gray-800 dark:text-neutral-200", children: heading }), content && ((0, jsx_runtime_1.jsx)("dd", { className: "text-lg text-gray-600 dark:text-neutral-400 break-all line-clamp-[8]", children: content }))] }) }));
}
exports.default = ContentMessage;
