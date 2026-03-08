"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
function ConnectionErrorToast({ message, link, }) {
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "toasts.connection_error",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium", children: [tCommon("errors.connection_failed"), " (", (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: message }), ")"] }), (0, jsx_runtime_1.jsx)("p", { className: "my-2 text-sm", children: t("what_you_can_do") }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc text-sm list-inside", children: [(0, jsx_runtime_1.jsx)("li", { children: t("double_check") }), link && ((0, jsx_runtime_1.jsxs)("li", { children: [tCommon("actions.open"), " ", (0, jsx_runtime_1.jsxs)("a", { href: link, className: "underline", target: "_blank", rel: "noreferrer noopener", children: [link.substring(0, 21), "..."] }), " ", t("if_ssl_errors")] })), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("a", { href: "https://guides.getalby.com/user-guide/browser-extension/link-wallet", className: "underline", target: "_blank", rel: "noreferrer noopener", children: t("visit_guides") }) })] })] }));
}
exports.default = ConnectionErrorToast;
