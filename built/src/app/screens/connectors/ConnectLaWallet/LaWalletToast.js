"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
function LaWalletToast({ domain }) {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "choose_connector.lawallet.errors.toast",
    });
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-md font-medium", children: [t("title"), " (", (0, jsx_runtime_1.jsx)("span", { className: "text-sm", children: t("message", { domain }) }), ")"] }), (0, jsx_runtime_1.jsx)("p", { className: "my-3 text-md", children: t("verify") }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc text-sm list-inside", children: [(0, jsx_runtime_1.jsx)("li", { children: t("match") }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "walias", t: t, values: { domain }, components: [(0, jsx_runtime_1.jsx)("b", {}, "walias-strong")] }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "endpoint", t: t, values: { domain }, components: [(0, jsx_runtime_1.jsx)("b", {}, "endpoint-strong")] }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: "http", t: t, components: [(0, jsx_runtime_1.jsx)("b", {}, "http-strong")] }) })] })] }));
}
exports.default = LaWalletToast;
